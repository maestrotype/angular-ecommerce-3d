import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Payment, PaymentRequest, PaymentResponse, PaymentStatus } from '../../../shared/models/payment.model';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = `${environment.apiUrl}/payments`;

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService
  ) { }

  createPayment(paymentRequest: PaymentRequest): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(`${this.apiUrl}`, paymentRequest)
      .pipe(
        map(response => response),
        catchError(error => {


          // Show user-friendly error notification
          if (error.status === 404) {
            this.notificationService.showError('Payment service is not available. Please try again later.');
          } else if (error.status === 403) {
            this.notificationService.showError('Access denied. Please log in again.');
          } else if (error.status === 0) {
            this.notificationService.showError('Network error. Please check your connection.');
          } else {
            this.notificationService.showError('Failed to create payment. Please try again.');
          }

          return throwError(() => new Error('Failed to create payment'));
        })
      );
  }

  getPaymentById(id: number): Observable<Payment> {
    return this.http.get<Payment>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(error => {

          this.notificationService.showError('Failed to fetch payment details.');
          return throwError(() => new Error('Failed to fetch payment'));
        })
      );
  }

  getPaymentsByOrderId(orderId: number): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.apiUrl}/order/${orderId}`)
      .pipe(
        catchError(error => {

          return throwError(() => new Error('Failed to fetch payments for order'));
        })
      );
  }

  // Webhook is called by LiqPay directly to the backend. No client call is needed.

  getPaymentStatus(paymentId: number): Observable<PaymentStatus> {
    return this.http.get<{ status: PaymentStatus }>(`${this.apiUrl}/${paymentId}/status`)
      .pipe(
        map(response => response.status),
        catchError(error => {

          return throwError(() => new Error('Failed to fetch payment status'));
        })
      );
  }

  createStripeIntent(params: { orderId: number; amount: number; currency: string; description?: string }): Observable<string> {
    type StripeIntentResponse = { success: boolean; data?: { clientSecret: string }; error?: string; message?: string };
    return this.http.post<StripeIntentResponse>(`${this.apiUrl}/stripe/intent`, params)
      .pipe(
        map(res => {
          if (res.success && res.data?.clientSecret) {
            return res.data.clientSecret;
          }
          const message = res.error || res.message || 'Failed to create Stripe intent';
          this.notificationService.showError(message);
          throw new Error(message);
        }),
        catchError(error => {
          if (error.status === 401 || error.status === 403) {
            this.notificationService.showError('Please log in to continue.');
          } else {
            this.notificationService.showError('Failed to create Stripe intent.');
          }
          return throwError(() => error);
        })
      );
  }

  createPayPalPayment(params: { orderId: number; amount: number; currency: string; description?: string }): Observable<{ approvalUrl: string; orderId: string }> {
    type PayPalResponse = { success: boolean; data?: { approvalUrl: string; orderId: string }; error?: string; message?: string };
    return this.http.post<PayPalResponse>(`${this.apiUrl}/paypal/create`, params)
      .pipe(
        map(res => {
          if (res.success && res.data?.approvalUrl) {
            return res.data;
          }
          const message = res.error || res.message || 'Failed to create PayPal payment';
          this.notificationService.showError(message);
          throw new Error(message);
        }),
        catchError(error => {
          if (error.status === 401 || error.status === 403) {
            this.notificationService.showError('Please log in to continue.');
          } else {
            this.notificationService.showError('Failed to create PayPal payment.');
          }
          return throwError(() => error);
        })
      );
  }

  // Admin methods for payment management
  getAllPayments(): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.apiUrl}`)
      .pipe(
        catchError(error => {

          this.notificationService.showError('Failed to fetch payments.');
          return throwError(() => new Error('Failed to fetch payments'));
        })
      );
  }

  getPaymentStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats/overview`)
      .pipe(
        catchError(error => {

          this.notificationService.showError('Failed to fetch payment statistics.');
          return throwError(() => new Error('Failed to fetch payment stats'));
        })
      );
  }

  searchPayments(filters: any = {}): Observable<Payment[]> {
    let params = new URLSearchParams();

    if (filters.status && filters.status !== 'all') {
      params.set('status', filters.status);
    }
    if (filters.method && filters.method !== 'all') {
      params.set('method', filters.method);
    }
    if (filters.customerEmail) {
      params.set('customerEmail', filters.customerEmail);
    }
    if (filters.minAmount) {
      params.set('minAmount', filters.minAmount.toString());
    }
    if (filters.maxAmount) {
      params.set('maxAmount', filters.maxAmount.toString());
    }
    if (filters.fromDate) {
      params.set('fromDate', filters.fromDate);
    }
    if (filters.toDate) {
      params.set('toDate', filters.toDate);
    }

    return this.http.get<Payment[]>(`${this.apiUrl}/search?${params.toString()}`)
      .pipe(
        catchError(error => {

          this.notificationService.showError('Failed to search payments.');
          return throwError(() => new Error('Failed to search payments'));
        })
      );
  }

  updatePaymentStatus(paymentId: number, status: string, notes?: string): Observable<Payment> {
    return this.http.put<Payment>(`${this.apiUrl}/${paymentId}/status`, { status, notes })
      .pipe(
        catchError(error => {

          this.notificationService.showError('Failed to update payment status.');
          return throwError(() => new Error('Failed to update payment status'));
        })
      );
  }
} 