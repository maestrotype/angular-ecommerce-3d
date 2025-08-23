import { Controller, Post, Get, Put, Body, Param, ParseIntPipe, HttpCode, HttpStatus, UseGuards, Headers, Query } from '@nestjs/common';
import { Request } from 'express';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto, LiqPayWebhookDto, PaymentResponseDto } from './dto/create-payment.dto';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';
import { SearchPaymentsDto } from './dto/search-payments.dto';
import { Payment } from './entities/payment.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createPayment(@Body() createPaymentDto: CreatePaymentDto): Observable<PaymentResponseDto> {
    return this.paymentsService.createPayment(createPaymentDto).pipe(
      map(result => ({
        success: true,
        data: result.data,
        message: 'Payment created successfully'
      })),
      catchError(error => of({
        success: false,
        error: error.message || 'Failed to create payment'
      }))
    );
  }

  @Post('liqpay/webhook')
  @HttpCode(HttpStatus.OK)
  handleLiqPayWebhook(
    @Body() webhookData: LiqPayWebhookDto,
    @Headers('x-liqpay-signature') signature: string
  ): Observable<PaymentResponseDto> {
    // Validate signature header
    if (!signature) {
      return of({
        success: false,
        error: 'Missing LiqPay signature header'
      });
    }

    return this.paymentsService.processLiqPayWebhook(webhookData.data, signature).pipe(
      map(() => ({
        success: true,
        message: 'Webhook processed successfully'
      })),
      catchError(error => of({
        success: false,
        error: error.message || 'Failed to process webhook'
      }))
    );
  }

  @Get('search')
  @UseGuards(JwtAuthGuard, AdminGuard)
  searchPayments(@Query() query: any): Observable<PaymentResponseDto> {
    console.log('[PaymentsController] searchPayments query:', query);
    console.log('[PaymentsController] query types:', typeof query.limit, typeof query.offset);
    
    const filters = {
      limit: query.limit ? parseInt(query.limit) : 20,
      offset: query.offset ? parseInt(query.offset) : 0,
      status: query.status,
      paymentMethod: query.paymentMethod,
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
      customerEmail: query.customerEmail,
      minAmount: query.minAmount ? parseInt(query.minAmount) : undefined,
      maxAmount: query.maxAmount ? parseInt(query.maxAmount) : undefined
    };
    
    console.log('[PaymentsController] parsed filters:', filters);
    return this.paymentsService.searchPayments(filters).pipe(
      map(payments => ({
        success: true,
        data: payments,
        message: 'Payments search completed successfully'
      })),
      catchError(error => of({
        success: false,
        error: error.message || 'Failed to search payments'
      }))
    );
  }

  @Get(':id')
  getPayment(@Param('id', ParseIntPipe) id: number): Observable<PaymentResponseDto> {
    return this.paymentsService.getPaymentById(id).pipe(
      map(payment => ({
        success: true,
        data: payment,
        message: 'Payment retrieved successfully'
      })),
      catchError(error => of({
        success: false,
        error: error.message || 'Failed to retrieve payment'
      }))
    );
  }

  @Get(':id/status')
  getPaymentStatus(@Param('id', ParseIntPipe) id: number): Observable<{ status: string }> {
    return this.paymentsService.getPaymentById(id).pipe(
      map((payment) => ({ status: payment.status }))
    );
  }

  @Get('order/:orderId')
  @UseGuards(JwtAuthGuard)
  getPaymentsByOrder(@Param('orderId', ParseIntPipe) orderId: number): Observable<PaymentResponseDto> {
    return this.paymentsService.getPaymentsByOrderId(orderId).pipe(
      map(payments => ({
        success: true,
        data: payments,
        message: 'Order payments retrieved successfully'
      })),
      catchError(error => of({
        success: false,
        error: error.message || 'Failed to retrieve order payments'
      }))
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)
  getAllPayments(): Observable<PaymentResponseDto> {
    return this.paymentsService.getAllPayments().pipe(
      map(payments => ({
        success: true,
        data: payments,
        message: 'All payments retrieved successfully'
      })),
      catchError(error => of({
        success: false,
        error: error.message || 'Failed to retrieve payments'
      }))
    );
  }

  @Get('stats/overview')
  @UseGuards(JwtAuthGuard, AdminGuard)
  getPaymentStats(): Observable<PaymentResponseDto> {
    return this.paymentsService.getPaymentStats().pipe(
      map(stats => ({
        success: true,
        data: stats,
        message: 'Payment statistics retrieved successfully'
      })),
      catchError(error => of({
        success: false,
        error: error.message || 'Failed to retrieve payment statistics'
      }))
    );
  }

  @Put(':id/status')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @HttpCode(HttpStatus.OK)
  updatePaymentStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePaymentStatusDto: UpdatePaymentStatusDto
  ): Observable<PaymentResponseDto> {
    return this.paymentsService.updatePaymentStatus(
      id, 
      updatePaymentStatusDto.status, 
      updatePaymentStatusDto.notes
    ).pipe(
      map(payment => ({
        success: true,
        data: payment,
        message: 'Payment status updated successfully'
      })),
      catchError(error => of({
        success: false,
        error: error.message || 'Failed to update payment status'
      }))
    );
  }

  @Post('stripe/intent')
  @HttpCode(HttpStatus.CREATED)
  createStripeIntent(@Body() body: { orderId: number; amount: number; currency: string; description?: string }): Observable<PaymentResponseDto> {
    console.log('[PaymentsController] createStripeIntent called with body:', body);
    
    return this.paymentsService.createStripeIntent(body).pipe(
      map((res) => {
        console.log('[PaymentsController] Stripe intent created successfully:', res);
        return { success: true, data: res, message: 'Stripe intent created' };
      }),
      catchError((error) => {
        console.error('[PaymentsController] Failed to create Stripe intent:', error);
        return of({ success: false, error: error.message || 'Failed to create Stripe intent' });
      })
    );
  }

  @Post('stripe/webhook')
  @HttpCode(HttpStatus.OK)
  handleStripeWebhook(@Body() body: any, @Headers('stripe-signature') signature: string, req: Request): Observable<{ received: boolean }> {
    const rawBody = (req as any).rawBody || JSON.stringify(body);
    return this.paymentsService.handleStripeWebhook(rawBody, signature).pipe(
      map(() => ({ received: true })),
      catchError(() => of({ received: false }))
    );
  }

  @Post('paypal/create')
  @HttpCode(HttpStatus.CREATED)
  createPayPalPayment(@Body() body: { orderId: number; amount: number; currency: string; description?: string }): Observable<PaymentResponseDto> {
    return this.paymentsService.createPayPalPayment(body).pipe(
      map((res) => ({ success: true, data: res, message: 'PayPal payment created' })),
      catchError((error) => of({ success: false, error: error.message || 'Failed to create PayPal payment' }))
    );
  }

  @Post('paypal/webhook')
  @HttpCode(HttpStatus.OK)
  handlePayPalWebhook(@Body() body: any, @Headers() headers: any): Observable<{ received: boolean }> {
    return this.paymentsService.handlePayPalWebhook(body, headers).pipe(
      map(() => ({ received: true })),
      catchError(() => of({ received: false }))
    );
  }
} 