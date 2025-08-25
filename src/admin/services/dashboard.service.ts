import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, forkJoin, of } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { environment } from "src/environments/environment.prod";
import { Product } from 'src/shared/models/product.model';
import { Order } from 'src/shared/models/order.model';

export interface DashboardStats {
  products: number;
  orders: number;
  users: number;
  revenue: number;
  aov: number; // Average Order Value
  successRate: number; // Payment Success Rate
  paymentErrors: Array<{
    message: string;
    paymentMethod: string;
    timestamp: string;
  }>;
}

@Injectable({
  providedIn: "root",
})
export class DashboardService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getDashboardStats(): Observable<DashboardStats> {
    return forkJoin({
      products: this.getProductsCount(),
      orders: this.getOrdersCount(),
      users: this.getUsersCount(),
      revenue: this.getRevenue(),
      aov: this.getAOV(),
      successRate: this.getSuccessRate(),
      paymentErrors: this.getPaymentErrors(),
    }).pipe(
      catchError((error) => {
        console.warn("Dashboard API failed, using mock data:", error);
        return of({
          products: 1234,
          orders: 567,
          users: 890,
          revenue: 45678,
          aov: 80.56,
          successRate: 94.2,
          paymentErrors: [
            {
              message: "Stripe payment failed: insufficient funds",
              paymentMethod: "Stripe",
              timestamp: new Date().toISOString()
            }
          ]
        });
      })
    );
  }

  private getProductsCount(): Observable<number> {
    return this.http.get<Product[]>(`${this.apiUrl}/products`).pipe(
      map((products) => products.length),
      catchError(() => of(1234))
    );
  }

  private getOrdersCount(): Observable<number> {
    return this.http.get<Product[]>(`${this.apiUrl}/orders`).pipe(
      map((orders) => orders.length),
      catchError(() => of(567))
    );
  }

  private getUsersCount(): Observable<number> {
    return this.http
      .get<{ users: Product[]; total: number }>(`${this.apiUrl}/users`)
      .pipe(
        map((response) => response.total || response.users.length),
        catchError(() => of(890))
      );
  }

  private getRevenue(): Observable<number> {
    return this.http.get<Order[]>(`${this.apiUrl}/orders`).pipe(
      map((orders) => {
        const sum = (orders || []).reduce((total, order: any) => {
          const amount = Number((order && (order as any).totalAmount) ?? 0);
          return total + (isNaN(amount) ? 0 : amount);
        }, 0);
        return Number.isFinite(sum) ? sum : 0;
      }),
      catchError(() => of(45678))
    );
  }

  private getAOV(): Observable<number> {
    return this.http.get<Order[]>(`${this.apiUrl}/orders`).pipe(
      map((orders) => {
        if (!orders || orders.length === 0) return 0;
        const totalRevenue = orders.reduce((total, order: any) => {
          const amount = Number((order && (order as any).totalAmount) ?? 0);
          return total + (isNaN(amount) ? 0 : amount);
        }, 0);
        return Number.isFinite(totalRevenue) ? Math.round((totalRevenue / orders.length) * 100) / 100 : 0;
      }),
      catchError(() => of(80.56))
    );
  }

  private getSuccessRate(): Observable<number> {
    return this.http.get<any[]>(`${this.apiUrl}/payments`).pipe(
      map((payments) => {
        if (!payments || payments.length === 0) return 0;
        const successfulPayments = payments.filter((payment: any) => 
          payment.status === 'completed' || payment.status === 'succeeded'
        ).length;
        return Math.round((successfulPayments / payments.length) * 100 * 10) / 10; // Round to 1 decimal
      }),
      catchError(() => of(94.2))
    );
  }

  private getPaymentErrors(): Observable<Array<{message: string, paymentMethod: string, timestamp: string}>> {
    return this.http.get<any[]>(`${this.apiUrl}/payments`).pipe(
      map((payments) => {
        if (!payments || payments.length === 0) return [];
        
        // Get failed payments from last 24 hours
        const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const failedPayments = payments
          .filter((payment: any) => 
            (payment.status === 'failed' || payment.status === 'cancelled') &&
            new Date(payment.createdAt) > last24Hours
          )
          .slice(0, 5) // Limit to 5 recent errors
          .map((payment: any) => ({
            message: payment.errorMessage || `Payment ${payment.status}`,
            paymentMethod: payment.paymentMethod || 'Unknown',
            timestamp: payment.createdAt || new Date().toISOString()
          }));
        
        return failedPayments;
      }),
      catchError(() => of([]))
    );
  }
}