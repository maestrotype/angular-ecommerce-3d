import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Payment, PaymentStats } from '../models/payment.model';
import { environment } from 'src/environments/environment.prod';

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
} 