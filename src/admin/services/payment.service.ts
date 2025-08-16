import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Payment, PaymentStats } from '../models/payment.model';
import { environment } from 'src/environments/environment.prod';

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
    return this.http.get<Payment[]>(this.apiUrl);
  }

  getPaymentById(id: number): Observable<Payment> {
    return this.http.get<Payment>(`${this.apiUrl}/${id}`);
  }

  getPaymentsByOrder(orderId: number): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.apiUrl}/order/${orderId}`);
  }

  getPaymentStats(): Observable<PaymentStats> {
    return this.http.get<PaymentStats>(`${this.apiUrl}/stats/overview`);
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

    return this.http.get<Payment[]>(`${this.apiUrl}/search`, { params });
  }

  updatePaymentStatus(id: number, body: UpdatePaymentStatusRequest): Observable<Payment> {
    return this.http.put<Payment>(`${this.apiUrl}/${id}/status`, body);
  }
} 