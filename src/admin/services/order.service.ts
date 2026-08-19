
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Order, OrderItem } from '../models/order.model';
import { OrderStats } from 'src/shared/models/order-stats.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = environment.apiUrl + '/orders';

  constructor(private http: HttpClient) { }

  getOrders(): Observable<Order[]> {
    return this.http.get<unknown>(this.apiUrl).pipe(
      map(res => {
        const list = Array.isArray(res)
          ? res
          : (res && typeof res === 'object' && Array.isArray((res as { data?: unknown }).data)
            ? (res as { data: unknown[] }).data
            : []);
        return list.map(item => normalizeOrder(item as Record<string, unknown>));
      })
    );
  }

  getOrder(id: number): Observable<Order> {
    return this.http.get<unknown>(`${this.apiUrl}/${id}`).pipe(
      map(res => {
        const order = unwrapOrderPayload(res);
        if (!order) {
          throw new Error('Order not found');
        }
        return normalizeOrder(order);
      })
    );
  }

  getPendingOrdersCount(): Observable<number> {
    return this.http.get<any>(`${this.apiUrl}?status=Pending`).pipe(
      map(res => {
        if (Array.isArray(res)) {
          return res.length;
        }
        return res.total || 0;
      })
    );
  }

  updateOrderStatus(id: number, status: string, notes?: string): Observable<Order> {
    return this.http.patch<unknown>(`${this.apiUrl}/${id}`, { status, notes }).pipe(
      map(res => {
        const order = unwrapOrderPayload(res);
        if (!order) {
          throw new Error('Order update failed');
        }
        return normalizeOrder(order);
      })
    );
  }

  getOrderStats(): Observable<OrderStats> {
    return this.http.get<any>(`${this.apiUrl}/stats`);
  }
}

function unwrapOrderPayload(res: unknown): Record<string, unknown> | null {
  if (!res || typeof res !== 'object') {
    return null;
  }

  const payload = res as { success?: boolean; data?: unknown; id?: unknown };
  if (payload.success === false) {
    return null;
  }

  if (payload.data && typeof payload.data === 'object' && !Array.isArray(payload.data)) {
    return payload.data as Record<string, unknown>;
  }

  if (payload.id != null) {
    return payload as Record<string, unknown>;
  }

  return null;
}

function normalizeOrder(raw: Record<string, unknown>): Order {
  const itemsSource = Array.isArray(raw['items']) ? raw['items'] : [];
  const items: OrderItem[] = itemsSource.map((item: any) => ({
    productId: Number(item?.productId) || 0,
    name: String(item?.name || item?.productName || ''),
    price: Number(item?.price ?? item?.unitPrice) || 0,
    quantity: Number(item?.quantity) || 0,
    image: String(item?.image || item?.imageUrl || '').trim() || undefined,
  }));

  return {
    id: Number(raw['id']) || 0,
    customerName: String(raw['customerName'] || ''),
    customerEmail: String(raw['customerEmail'] || ''),
    customerPhone: raw['customerPhone'] ? String(raw['customerPhone']) : '',
    items,
    totalAmount: Number(raw['totalAmount']) || 0,
    status: String(raw['status'] || 'pending'),
    shippingAddress: raw['shippingAddress'] ? String(raw['shippingAddress']) : '',
    city: raw['city'] ? String(raw['city']) : '',
    postalCode: raw['postalCode'] ? String(raw['postalCode']) : '',
    country: raw['country'] ? String(raw['country']) : '',
    paymentMethod: raw['paymentMethod'] ? String(raw['paymentMethod']) : '',
    notes: raw['notes'] ? String(raw['notes']) : '',
    createdAt: (raw['createdAt'] as Date | string) || '',
    updatedAt: (raw['updatedAt'] as Date | string) || '',
  };
}
