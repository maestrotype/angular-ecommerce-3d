import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment.prod';
import { Payment, PaymentRequest, PaymentResponse, PaymentStatus } from '../../../shared/models/payment.model';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = `${environment.apiUrl}/payments`;

  constructor(private http: HttpClient) {}

  createPayment(paymentRequest: PaymentRequest): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(`${this.apiUrl}/create`, paymentRequest)
      .pipe(
        map(response => response),
        catchError(error => {
          console.error('Error creating payment:', error);
          return throwError(() => new Error('Failed to create payment'));
        })
      );
  }

  getPaymentById(id: number): Observable<Payment> {
    return this.http.get<Payment>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(error => {
          console.error('Error fetching payment:', error);
          return throwError(() => new Error('Failed to fetch payment'));
        })
      );
  }

  getPaymentsByOrderId(orderId: number): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.apiUrl}/order/${orderId}`)
      .pipe(
        catchError(error => {
          console.error('Error fetching payments for order:', error);
          return throwError(() => new Error('Failed to fetch payments for order'));
        })
      );
  }

  processLiqPayWebhook(data: string, signature: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/liqpay-webhook`, { data, signature })
      .pipe(
        catchError(error => {
          console.error('Error processing LiqPay webhook:', error);
          return throwError(() => new Error('Failed to process webhook'));
        })
      );
  }

  getPaymentStatus(paymentId: number): Observable<PaymentStatus> {
    return this.http.get<{ status: PaymentStatus }>(`${this.apiUrl}/${paymentId}/status`)
      .pipe(
        map(response => response.status),
        catchError(error => {
          console.error('Error fetching payment status:', error);
          return throwError(() => new Error('Failed to fetch payment status'));
        })
      );
  }
} 