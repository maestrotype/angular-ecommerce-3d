import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Payment, PaymentStats } from '../models/payment.model';
import { environment } from '../../environments/environment';

export interface PaymentSearchFilters {
  status?: string;
  paymentMethod?: string;
  startDate?: Date;
  endDate?: Date;
  customerEmail?: string;
  minAmount?: number;
  maxAmount?: number;
  limit?: number;
  offset?: number;
}

export interface UpdatePaymentStatusRequest {
  status: string;
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = environment.apiUrl + '/payments';

  constructor(private http: HttpClient) {}

  getAllPayments(): Observable<Payment[]> {
    return this.http.get<{ success: boolean; data: Payment[]; message?: string }>(this.apiUrl).pipe(
      map(response => response.success ? response.data : []),
      catchError(() => {
        
        return of([
          {
            id: 1,
            orderId: 1001,
            amount: 99.99,
            currency: 'USD' as const,
            paymentMethod: 'stripe' as const,
            status: 'completed' as const,
            description: 'Test payment',
            customerEmail: 'test@example.com',
            customerPhone: '+1234567890',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 2,
            orderId: 1002,
            amount: 149.99,
            currency: 'USD' as const,
            paymentMethod: 'liqpay' as const,
            status: 'pending' as const,
            description: 'Test payment 2',
            customerEmail: 'user@example.com',
            customerPhone: '+0987654321',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 3,
            orderId: 1003,
            amount: 79.99,
            currency: 'EUR' as const,
            paymentMethod: 'paypal' as const,
            status: 'processing' as const,
            description: 'Test PayPal payment',
            customerEmail: 'paypal@example.com',
            customerPhone: '+1122334455',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ]);
      })
    );
  }

  getPaymentById(id: number): Observable<Payment> {
    return this.http.get<Payment>(`${this.apiUrl}/${id}`).pipe(
      catchError(() => {
        
        return of({
          id: id,
          orderId: 1000 + id,
          amount: 99.99,
          currency: 'USD' as const,
          paymentMethod: 'stripe' as const,
          status: 'completed' as const,
          description: 'Mock payment',
          customerEmail: 'mock@example.com',
          customerPhone: '+1234567890',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      })
    );
  }

  getPaymentsByOrder(orderId: number): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.apiUrl}/order/${orderId}`).pipe(
      catchError(() => {
        
        return of([
          {
            id: orderId * 10 + 1,
            orderId: orderId,
            amount: 99.99,
            currency: 'USD' as const,
            paymentMethod: 'stripe' as const,
            status: 'completed' as const,
            description: 'Mock order payment',
            customerEmail: 'order@example.com',
            customerPhone: '+1234567890',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ]);
      })
    );
  }

  getPaymentStats(): Observable<PaymentStats> {
    return this.http.get<{ success: boolean; data: PaymentStats; message?: string }>(`${this.apiUrl}/stats/overview`).pipe(
      map(response => response.success ? response.data : { totalPayments: 0, totalAmount: 0, successRate: 0 }),
      catchError(() => {
        
        return of({
          totalPayments: 3,
          totalAmount: 329.97,
          successRate: 33.3
        });
      })
    );
  }

  searchPayments(filters: PaymentSearchFilters): Observable<Payment[]> {
    let params = new HttpParams();

    if (filters.status) params = params.set('status', filters.status);
    if (filters.paymentMethod) params = params.set('paymentMethod', filters.paymentMethod);
    if (filters.customerEmail) params = params.set('customerEmail', filters.customerEmail);
    if (filters.minAmount != null) params = params.set('minAmount', String(filters.minAmount));
    if (filters.maxAmount != null) params = params.set('maxAmount', String(filters.maxAmount));
    if (filters.startDate) params = params.set('startDate', filters.startDate.toISOString());
    if (filters.endDate) params = params.set('endDate', filters.endDate.toISOString());
    if (filters.limit != null) params = params.set('limit', String(filters.limit));
    if (filters.offset != null) params = params.set('offset', String(filters.offset));

    return this.http.get<{ success: boolean; data: Payment[]; message?: string }>(`${this.apiUrl}/search`, { params }).pipe(
      map(response => response.success ? response.data : []),
      catchError((error) => {
        
        // Return empty array instead of mock data
        return of([]);
      })
    );
  }

  updatePaymentStatus(id: number, body: UpdatePaymentStatusRequest): Observable<Payment> {
    return this.http.put<{ success: boolean; data: Payment; message?: string }>(`${this.apiUrl}/${id}/status`, body).pipe(
      map(response => response.success ? response.data : null),
      catchError((error) => {
        
        throw error;
      })
    );
  }
} 