import { Controller, Post, Get, Put, Body, Param, ParseIntPipe, HttpCode, HttpStatus, UseGuards, Headers, Query } from '@nestjs/common';
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
  @UseGuards(JwtAuthGuard)
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

  @Get(':id')
  @UseGuards(JwtAuthGuard)
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

  @Get('search')
  @UseGuards(JwtAuthGuard, AdminGuard)
  searchPayments(@Query() searchPaymentsDto: SearchPaymentsDto): Observable<PaymentResponseDto> {
    return this.paymentsService.searchPayments(searchPaymentsDto).pipe(
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
} 