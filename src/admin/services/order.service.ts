
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Order } from '../models/order.model';
import { OrderStats } from 'src/shared/models/order-stats.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = environment.apiUrl + '/orders';

  constructor(private http: HttpClient) {}

  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.apiUrl);
  }

  getOrder(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${id}`);
  }

  getPendingOrdersCount(): Observable<number> {
    return this.http.get<{ total: number }>(`${this.apiUrl}?status=Pending`).pipe(
      map(res => res.total)
    );
  }

  updateOrderStatus(id: number, status: string, notes?: string): Observable<Order> {
    return this.http.patch<Order>(`${this.apiUrl}/${id}`, { status, notes });
  }

  getOrderStats(): Observable<OrderStats> {
    return this.http.get<any>(`${this.apiUrl}/stats`);
  }
}
