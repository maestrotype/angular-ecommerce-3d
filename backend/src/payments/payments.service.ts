import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Observable, from, throwError, forkJoin, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { Payment, PaymentStatus, PaymentMethod, Currency } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentStrategy, PaymentData, PaymentResult } from './interfaces/payment-strategy.interface';
import { LiqPayStrategy } from './strategies/liqpay.strategy';
import { NotificationsService } from '../notifications/notifications.service';
import { OrdersService } from '../orders/orders.service';
import { EmailService } from '../email/email.service';
import { StripeStrategy } from './strategies/stripe.strategy';

@Injectable()
export class PaymentsService {
  private readonly paymentStrategies: Map<PaymentMethod, PaymentStrategy> = new Map();

  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    private liqpayStrategy: LiqPayStrategy,
    private notificationsService: NotificationsService,
    private ordersService: OrdersService,
    private emailService: EmailService,
    private stripeStrategy: StripeStrategy
  ) {
    // Register payment strategies
    this.paymentStrategies.set(PaymentMethod.LIQPAY, this.liqpayStrategy);
    // Stripe is handled via dedicated methods below
  }

  createPayment(createPaymentDto: CreatePaymentDto): Observable<PaymentResult> {
    // Validate and convert payment method
    let paymentMethod: PaymentMethod;
    try {
      paymentMethod = createPaymentDto.paymentMethod as PaymentMethod;
      if (!Object.values(PaymentMethod).includes(paymentMethod)) {
        return throwError(() => new BadRequestException(`Payment method ${createPaymentDto.paymentMethod} is not supported`));
      }
    } catch (error) {
      return throwError(() => new BadRequestException(`Invalid payment method: ${createPaymentDto.paymentMethod}`));
    }

    // Validate and convert currency
    let currency: Currency;
    try {
      currency = createPaymentDto.currency as Currency;
      if (!Object.values(Currency).includes(currency)) {
        return throwError(() => new BadRequestException(`Currency ${createPaymentDto.currency} is not supported`));
      }
    } catch (error) {
      return throwError(() => new BadRequestException(`Invalid currency: ${createPaymentDto.currency}`));
    }

    // Get payment strategy
    const strategy = this.paymentStrategies.get(paymentMethod);
    if (!strategy) {
      return throwError(() => new BadRequestException(`Payment method ${paymentMethod} is not supported`));
    }

    // Check if currency is supported by strategy
    if (!strategy.isSupported(currency)) {
      return throwError(() => new BadRequestException(`Currency ${currency} is not supported for ${paymentMethod}`));
    }

    // Create payment record in database
    const payment = this.paymentRepository.create({
      orderId: createPaymentDto.orderId,
      amount: createPaymentDto.amount,
      currency: currency,
      paymentMethod: paymentMethod,
      status: PaymentStatus.PENDING,
      description: createPaymentDto.description,
      customerEmail: createPaymentDto.customerEmail,
      customerPhone: createPaymentDto.customerPhone,
      metadata: createPaymentDto.metadata
    });

    return from(this.paymentRepository.save(payment)).pipe(
      switchMap(savedPayment => {
        // Create payment using strategy
        const paymentData: PaymentData = {
          orderId: createPaymentDto.orderId,
          amount: createPaymentDto.amount,
          currency: currency,
          description: createPaymentDto.description,
          customerEmail: createPaymentDto.customerEmail,
          customerPhone: createPaymentDto.customerPhone
        };

        return this.ensureObservable(strategy.createPayment(paymentData)).pipe(
          switchMap(result => {
            if (result.success) {
              // Update payment with transaction details
              return from(this.paymentRepository.update(savedPayment.id, {
                transactionId: result.transactionId,
                liqpayPaymentId: result.paymentId
              })).pipe(
                switchMap(() => {
                  // Send notification using EmailService
                  return from(this.emailService.sendPaymentCreated(savedPayment, { id: createPaymentDto.orderId } as any)).pipe(
                    map(() => ({
                      success: true,
                      data: result.data,
                      paymentId: savedPayment.id.toString(),
                      transactionId: result.transactionId
                    }))
                  );
                })
              );
            } else {
              // Update payment status to failed
              return from(this.paymentRepository.update(savedPayment.id, {
                status: PaymentStatus.FAILED
              })).pipe(
                switchMap(() => throwError(() => new BadRequestException(result.error)))
              );
            }
          })
        );
      }),
      catchError(error => {
        // Show error popup instead of logging
        this.notificationsService.create({
          type: 'system' as any,
          title: 'Payment Error',
          message: `Failed to create payment: ${error.message}`,
          data: { error: error.message, type: 'payment_creation_error' }
        });
        
        // Return proper NestJS exception instead of raw error
        if (error instanceof BadRequestException) {
          return throwError(() => error);
        } else {
          return throwError(() => new InternalServerErrorException(`Payment creation failed: ${error.message}`));
        }
      })
    );
  }

  processLiqPayWebhook(data: string, signature: string): Observable<void> {
    // Verify webhook signature
    const strategy = this.paymentStrategies.get(PaymentMethod.LIQPAY);
    if (!strategy) {
      return throwError(() => new BadRequestException('LiqPay strategy not found'));
    }

    return this.ensureObservable(strategy.verifyWebhook(data, signature)).pipe(
      switchMap(isValid => {
        if (!isValid) {
          return throwError(() => new BadRequestException('Invalid LiqPay webhook signature'));
        }

        // Parse webhook data
        const decodedData = Buffer.from(data, 'base64').toString('utf-8');
        const webhookData = JSON.parse(decodedData);

        // Find payment by order ID
        return from(this.paymentRepository.findOne({
          where: { orderId: parseInt(webhookData.order_id) }
        })).pipe(
          switchMap(payment => {
            if (!payment) {
              return throwError(() => new NotFoundException(`Payment not found for order ${webhookData.order_id}`));
            }

            // Process webhook based on status
            return this.processLiqPayStatus(payment, webhookData).pipe(
              map(() => void 0)
            );
          })
        );
      }),
      catchError(error => {
        // Show error popup instead of logging
        this.notificationsService.create({
          type: 'system' as any,
          title: 'Webhook Error',
          message: `Failed to process LiqPay webhook: ${error.message}`,
          data: { error: error.message, type: 'webhook_error' }
        });
        return throwError(() => error);
      })
    );
  }

  private processLiqPayStatus(payment: Payment, webhookData: any): Observable<void> {
    const { status, liqpay_order_id } = webhookData;

    switch (status) {
      case 'success':
        // Payment successful
        return from(this.paymentRepository.update(payment.id, {
          status: PaymentStatus.COMPLETED,
          liqpayPaymentId: liqpay_order_id
        })).pipe(
          switchMap(() => {
            // Update order status
            return from(this.ordersService.update(payment.orderId, { status: 'confirmed' as any }));
          }),
          switchMap(() => {
            // Send success notification using EmailService
            return this.emailService.sendPaymentSuccess(payment, { id: payment.orderId } as any);
          })
        );

      case 'failure':
        // Payment failed
        return from(this.paymentRepository.update(payment.id, {
          status: PaymentStatus.FAILED
        })).pipe(
          switchMap(() => {
            // Send failure notification using EmailService
            return this.emailService.sendPaymentFailed(payment, { id: payment.orderId } as any);
          })
        );

      case 'wait_accept':
        // Payment pending
        return from(this.paymentRepository.update(payment.id, {
          status: PaymentStatus.PROCESSING
        })).pipe(
          map(() => void 0)
        );

      default:
        // Unknown status - show warning popup
        this.notificationsService.create({
          type: 'system' as any,
          title: 'Unknown Payment Status',
          message: `Unknown LiqPay status: ${status}`,
          data: { orderId: payment.orderId, status }
        });
        return of(void 0);
    }
  }

  getPaymentById(id: number): Observable<Payment> {
    return from(this.paymentRepository.findOne({ where: { id } })).pipe(
      map(payment => {
        if (!payment) {
          throw new NotFoundException(`Payment with ID ${id} not found`);
        }
        return payment;
      }),
      catchError(error => throwError(() => error))
    );
  }

  getPaymentsByOrderId(orderId: number): Observable<Payment[]> {
    return from(this.paymentRepository.find({ where: { orderId } }));
  }

  getAllPayments(): Observable<Payment[]> {
    return from(this.paymentRepository.find({
      order: { createdAt: 'DESC' }
    }));
  }

  getPaymentStats(): Observable<{ totalPayments: number; totalAmount: number; successRate: number }> {
    return forkJoin({
      totalPayments: from(this.paymentRepository.count()),
      completedPayments: from(this.paymentRepository.count({ where: { status: PaymentStatus.COMPLETED } })),
      totalAmount: from(this.paymentRepository
        .createQueryBuilder('payment')
        .select('SUM(payment.amount)', 'sum')
        .where('payment.status = :status', { status: PaymentStatus.COMPLETED })
        .getRawOne()
      )
    }).pipe(
      map(({ totalPayments, completedPayments, totalAmount }) => {
        const successRate = totalPayments > 0 ? (completedPayments / totalPayments) * 100 : 0;

        return {
          totalPayments,
          totalAmount: parseFloat(totalAmount.sum) || 0,
          successRate: Math.round(successRate * 100) / 100
        };
      })
    );
  }

  updatePaymentStatus(id: number, status: PaymentStatus, notes?: string): Observable<Payment> {
    return this.getPaymentById(id).pipe(
      switchMap(payment => {
        const updateData: Partial<Payment> = { status };
        
        if (notes) {
          updateData.metadata = JSON.stringify({ 
            ...JSON.parse(payment.metadata || '{}'), 
            adminNotes: notes,
            updatedAt: new Date().toISOString()
          });
        }

        return from(this.paymentRepository.update(id, updateData)).pipe(
          switchMap(() => this.getPaymentById(id))
        );
      }),
      catchError(error => throwError(() => new InternalServerErrorException(`Failed to update payment status: ${error.message}`)))
    );
  }

  searchPayments(filters: {
    status?: PaymentStatus;
    paymentMethod?: PaymentMethod;
    startDate?: Date;
    endDate?: Date;
    customerEmail?: string;
    minAmount?: number;
    maxAmount?: number;
  }): Observable<Payment[]> {
    const queryBuilder = this.paymentRepository.createQueryBuilder('payment');

    if (filters.status) {
      queryBuilder.andWhere('payment.status = :status', { status: filters.status });
    }

    if (filters.paymentMethod) {
      queryBuilder.andWhere('payment.paymentMethod = :paymentMethod', { paymentMethod: filters.paymentMethod });
    }

    if (filters.startDate) {
      queryBuilder.andWhere('payment.createdAt >= :startDate', { startDate: filters.startDate });
    }

    if (filters.endDate) {
      queryBuilder.andWhere('payment.createdAt <= :endDate', { endDate: filters.endDate });
    }

    if (filters.customerEmail) {
      queryBuilder.andWhere('payment.customerEmail ILIKE :customerEmail', { customerEmail: `%${filters.customerEmail}%` });
    }

    if (filters.minAmount !== undefined) {
      queryBuilder.andWhere('payment.amount >= :minAmount', { minAmount: filters.minAmount });
    }

    if (filters.maxAmount !== undefined) {
      queryBuilder.andWhere('payment.amount <= :maxAmount', { maxAmount: filters.maxAmount });
    }

    return from(queryBuilder
      .orderBy('payment.createdAt', 'DESC')
      .getMany()
    ).pipe(
      catchError(error => throwError(() => new InternalServerErrorException(`Failed to search payments: ${error.message}`)))
    );
  }

  createStripeIntent(body: { orderId: number; amount: number; currency: string; description?: string }): Observable<{ clientSecret: string }> {
    const paymentData: PaymentData = {
      orderId: Number(body.orderId),
      amount: Number(body.amount),
      currency: body.currency as any,
      description: body.description || `Order #${body.orderId}`
    };

    // Ensure we have a payment record for this order
    const ensurePayment$ = from(this.paymentRepository.findOne({ where: { orderId: paymentData.orderId } })).pipe(
      switchMap(existing => {
        if (existing) {
          return of(existing);
        }
        const payment = this.paymentRepository.create({
          orderId: paymentData.orderId,
          amount: paymentData.amount,
          currency: paymentData.currency as Currency,
          paymentMethod: PaymentMethod.STRIPE,
          status: PaymentStatus.PENDING,
          description: paymentData.description
        });
        return from(this.paymentRepository.save(payment));
      })
    );

    return ensurePayment$.pipe(
      switchMap(() => this.stripeStrategy.createPayment(paymentData)),
      switchMap(result => {
        if (!result.success || !result.data?.clientSecret) {
          return throwError(() => new BadRequestException(result.error || 'Stripe intent creation failed'));
        }
        return of({ clientSecret: result.data.clientSecret });
      })
    );
  }

  handleStripeWebhook(rawBody: string, signature: string): Observable<void> {
    const event = this.stripeStrategy.constructEvent(rawBody, signature);
    if (!event) {
      return throwError(() => new BadRequestException('Invalid Stripe signature'));
    }

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const intent: any = (event as any).data.object;
        const orderId = Number(intent.metadata?.orderId);
        if (!orderId) return of(void 0);
        return from(this.paymentRepository.findOne({ where: { orderId } })).pipe(
          switchMap(payment => {
            if (!payment) return of(void 0);
            return from(this.paymentRepository.update(payment.id, { status: PaymentStatus.COMPLETED, transactionId: intent.id })).pipe(
              switchMap(() => from(this.ordersService.update(payment.orderId, { status: 'confirmed' as any }))),
              switchMap(() => this.emailService.sendPaymentSuccess(payment, { id: payment.orderId } as any)),
              map(() => void 0)
            );
          })
        );
      }
      case 'payment_intent.payment_failed': {
        const intent: any = (event as any).data.object;
        const orderId = Number(intent.metadata?.orderId);
        if (!orderId) return of(void 0);
        return from(this.paymentRepository.findOne({ where: { orderId } })).pipe(
          switchMap(payment => {
            if (!payment) return of(void 0);
            return from(this.paymentRepository.update(payment.id, { status: PaymentStatus.FAILED, errorMessage: intent.last_payment_error?.message })).pipe(
              switchMap(() => this.emailService.sendPaymentFailed(payment, { id: payment.orderId } as any)),
              map(() => void 0)
            );
          })
        );
      }
      default:
        return of(void 0);
    }
  }

  private ensureObservable<T>(value: Observable<T> | Promise<T> | T): Observable<T> {
    if ((value as any)?.subscribe) {
      return value as Observable<T>;
    }
    return from(Promise.resolve(value as T));
  }
} 