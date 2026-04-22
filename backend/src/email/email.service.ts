import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable, of, throwError, from } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { NotificationsService } from '../notifications/notifications.service';
import { Payment } from '../payments/entities/payment.entity';
import { Order } from '../orders/entities/order.entity';

@Injectable()
export class EmailService {
  private readonly frontendUrl: string;
  private readonly companyName: string;

  constructor(
    private configService: ConfigService,
    private notificationsService: NotificationsService
  ) {
    this.frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:4200';
    this.companyName = this.configService.get<string>('COMPANY_NAME') || '3D Store';
  }

  sendPaymentSuccess(payment: Payment, order: Order): Observable<void> {
    const notificationData = {
      type: 'payment_success' as any,
      title: 'NOTIFICATION.PAYMENT_SUCCESS.TITLE',
      message: 'NOTIFICATION.PAYMENT_SUCCESS.MESSAGE',
      data: {
        paymentId: payment.id,
        orderId: order.id,
        amount: payment.amount,
        currency: payment.currency,
        paymentMethod: payment.paymentMethod
      }
    };

    return from(this.notificationsService.create(notificationData)).pipe(
      map(() => {
        // Success notification sent - show popup
        this.notificationsService.create({
          type: 'system' as any,
          title: 'NOTIFICATION.SYSTEM.SENT_TITLE',
          message: 'NOTIFICATION.SYSTEM.SENT_MESSAGE',
          data: { orderId: order.id, type: 'payment_success' }
        });
      }),
      catchError(error => {
        // Error occurred - show error popup
        this.notificationsService.create({
          type: 'system' as any,
          title: 'NOTIFICATION.SYSTEM.ERROR_TITLE',
          message: 'NOTIFICATION.SYSTEM.ERROR_MESSAGE',
          data: { orderId: order.id, type: 'error', error: error.message }
        });
        return throwError(() => new InternalServerErrorException(`Failed to send payment success notification: ${error.message}`));
      })
    );
  }

  sendPaymentFailed(payment: Payment, order: Order): Observable<void> {
    const notificationData = {
      type: 'payment_failed' as any,
      title: 'NOTIFICATION.PAYMENT_FAILED.TITLE',
      message: 'NOTIFICATION.PAYMENT_FAILED.MESSAGE',
      data: {
        paymentId: payment.id,
        orderId: order.id,
        amount: payment.amount,
        currency: payment.currency,
        paymentMethod: payment.paymentMethod,
        errorMessage: payment.errorMessage
      }
    };

    return from(this.notificationsService.create(notificationData)).pipe(
      map(() => {
        // Failed notification sent - show popup
        this.notificationsService.create({
          type: 'system' as any,
          title: 'NOTIFICATION.SYSTEM.SENT_TITLE',
          message: 'NOTIFICATION.SYSTEM.SENT_MESSAGE',
          data: { orderId: order.id, type: 'payment_failed' }
        });
      }),
      catchError(error => {
        // Error occurred - show error popup
        this.notificationsService.create({
          type: 'system' as any,
          title: 'NOTIFICATION.SYSTEM.ERROR_TITLE',
          message: 'NOTIFICATION.SYSTEM.ERROR_MESSAGE',
          data: { orderId: order.id, type: 'error', error: error.message }
        });
        return throwError(() => new InternalServerErrorException(`Failed to send payment failed notification: ${error.message}`));
      })
    );
  }

  sendOrderConfirmation(order: Order): Observable<void> {
    const notificationData = {
      type: 'order_confirmation' as any,
      title: 'NOTIFICATION.ORDER_CONFIRMATION.TITLE',
      message: 'NOTIFICATION.ORDER_CONFIRMATION.MESSAGE',
      data: {
        orderId: order.id,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        totalAmount: order.totalAmount,
        items: order.items
      }
    };

    return from(this.notificationsService.create(notificationData)).pipe(
      map(() => {
        // Order confirmation sent - show popup
        this.notificationsService.create({
          type: 'system' as any,
          title: 'NOTIFICATION.SYSTEM.SENT_TITLE',
          message: 'NOTIFICATION.SYSTEM.SENT_MESSAGE',
          data: { orderId: order.id, type: 'order_confirmation' }
        });
      }),
      catchError(error => {
        // Error occurred - show error popup
        this.notificationsService.create({
          type: 'system' as any,
          title: 'NOTIFICATION.SYSTEM.ERROR_TITLE',
          message: 'NOTIFICATION.SYSTEM.ERROR_MESSAGE',
          data: { orderId: order.id, type: 'error', error: error.message }
        });
        return throwError(() => new InternalServerErrorException(`Failed to send order confirmation: ${error.message}`));
      })
    );
  }

  sendOrderStatusUpdate(order: Order, oldStatus: string, newStatus: string): Observable<void> {
    const notificationData = {
      type: 'order_status_update' as any,
      title: 'NOTIFICATION.ORDER_STATUS_UPDATE.TITLE',
      message: 'NOTIFICATION.ORDER_STATUS_UPDATE.MESSAGE',
      data: {
        orderId: order.id,
        oldStatus,
        newStatus,
        customerName: order.customerName,
        customerEmail: order.customerEmail
      }
    };

    return from(this.notificationsService.create(notificationData)).pipe(
      map(() => {
        // Status update sent - show popup
        this.notificationsService.create({
          type: 'system' as any,
          title: 'NOTIFICATION.SYSTEM.SENT_TITLE',
          message: 'NOTIFICATION.SYSTEM.SENT_MESSAGE',
          data: { orderId: order.id, type: 'order_status_update' }
        });
      }),
      catchError(error => {
        // Error occurred - show error popup
        this.notificationsService.create({
          type: 'system' as any,
          title: 'NOTIFICATION.SYSTEM.ERROR_TITLE',
          message: 'NOTIFICATION.SYSTEM.ERROR_MESSAGE',
          data: { orderId: order.id, type: 'error', error: error.message }
        });
        return throwError(() => new InternalServerErrorException(`Failed to send status update: ${error.message}`));
      })
    );
  }

  sendPaymentCreated(payment: Payment, order: Order): Observable<void> {
    const notificationData = {
      type: 'payment_created' as any,
      title: 'NOTIFICATION.PAYMENT_CREATED.TITLE',
      message: 'NOTIFICATION.PAYMENT_CREATED.MESSAGE',
      data: {
        paymentId: payment.id,
        orderId: order.id,
        amount: payment.amount,
        currency: payment.currency,
        paymentMethod: payment.paymentMethod
      }
    };

    return from(this.notificationsService.create(notificationData)).pipe(
      map(() => {
        // Payment created notification sent - show popup
        this.notificationsService.create({
          type: 'system' as any,
          title: 'NOTIFICATION.SYSTEM.SENT_TITLE',
          message: 'NOTIFICATION.SYSTEM.SENT_MESSAGE',
          data: { orderId: order.id, type: 'payment_created' }
        });
      }),
      catchError(error => {
        // Error occurred - show error popup
        this.notificationsService.create({
          type: 'system' as any,
          title: 'NOTIFICATION.SYSTEM.ERROR_TITLE',
          message: 'NOTIFICATION.SYSTEM.ERROR_MESSAGE',
          data: { orderId: order.id, type: 'error', error: error.message }
        });
        return throwError(() => new InternalServerErrorException(`Failed to send payment created notification: ${error.message}`));
      })
    );
  }
} 