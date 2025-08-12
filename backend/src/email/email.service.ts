import { Injectable } from '@nestjs/common';
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
      title: 'Payment Successful',
      message: `Payment completed for order #${order.id}`,
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
          title: 'Notification Sent',
          message: `Payment success notification sent for order #${order.id}`,
          data: { orderId: order.id, type: 'payment_success' }
        });
      }),
      catchError(error => {
        // Error occurred - show error popup
        this.notificationsService.create({
          type: 'system' as any,
          title: 'Notification Error',
          message: `Failed to send payment success notification: ${error.message}`,
          data: { orderId: order.id, type: 'error' }
        });
        return throwError(() => error);
      })
    );
  }

  sendPaymentFailed(payment: Payment, order: Order): Observable<void> {
    const notificationData = {
      type: 'payment_failed' as any,
      title: 'Payment Failed',
      message: `Payment failed for order #${order.id}`,
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
          title: 'Notification Sent',
          message: `Payment failed notification sent for order #${order.id}`,
          data: { orderId: order.id, type: 'payment_failed' }
        });
      }),
      catchError(error => {
        // Error occurred - show error popup
        this.notificationsService.create({
          type: 'system' as any,
          title: 'Notification Error',
          message: `Failed to send payment failed notification: ${error.message}`,
          data: { orderId: order.id, type: 'error' }
        });
        return throwError(() => error);
      })
    );
  }

  sendOrderConfirmation(order: Order): Observable<void> {
    const notificationData = {
      type: 'order_confirmation' as any,
      title: 'Order Confirmation',
      message: `Order #${order.id} has been confirmed`,
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
          title: 'Notification Sent',
          message: `Order confirmation sent for order #${order.id}`,
          data: { orderId: order.id, type: 'order_confirmation' }
        });
      }),
      catchError(error => {
        // Error occurred - show error popup
        this.notificationsService.create({
          type: 'system' as any,
          title: 'Notification Error',
          message: `Failed to send order confirmation: ${error.message}`,
          data: { orderId: order.id, type: 'error' }
        });
        return throwError(() => error);
      })
    );
  }

  sendOrderStatusUpdate(order: Order, oldStatus: string, newStatus: string): Observable<void> {
    const notificationData = {
      type: 'order_status_update' as any,
      title: 'Order Status Updated',
      message: `Order #${order.id} status changed from ${oldStatus} to ${newStatus}`,
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
          title: 'Notification Sent',
          message: `Order status update sent for order #${order.id}`,
          data: { orderId: order.id, type: 'order_status_update' }
        });
      }),
      catchError(error => {
        // Error occurred - show error popup
        this.notificationsService.create({
          type: 'system' as any,
          title: 'Notification Error',
          message: `Failed to send status update: ${error.message}`,
          data: { orderId: order.id, type: 'error' }
        });
        return throwError(() => error);
      })
    );
  }

  sendPaymentCreated(payment: Payment, order: Order): Observable<void> {
    const notificationData = {
      type: 'payment_created' as any,
      title: 'Payment Created',
      message: `Payment created for order #${order.id}`,
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
          title: 'Notification Sent',
          message: `Payment created notification sent for order #${order.id}`,
          data: { orderId: order.id, type: 'payment_created' }
        });
      }),
      catchError(error => {
        // Error occurred - show error popup
        this.notificationsService.create({
          type: 'system' as any,
          title: 'Notification Error',
          message: `Failed to send payment created notification: ${error.message}`,
          data: { orderId: order.id, type: 'error' }
        });
        return throwError(() => error);
      })
    );
  }
} 