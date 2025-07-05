
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';

export interface OrderItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  shippingAddress?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = environment.apiUrl + '/orders';

  async getOrders(): Promise<Order[]> {
    const response = await fetch(this.apiUrl);
    
    if (!response.ok) {
      throw new Error('Failed to fetch orders');
    }

    return await response.json();
  }

  async getOrder(id: number): Promise<Order> {
    const response = await fetch(`${this.apiUrl}/${id}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch order');
    }

    return await response.json();
  }

  async updateOrderStatus(id: number, status: string, notes?: string): Promise<Order> {
    const response = await fetch(`${this.apiUrl}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status, notes }),
    });

    if (!response.ok) {
      throw new Error('Failed to update order');
    }

    return await response.json();
  }

  async getOrderStats() {
    const response = await fetch(`${this.apiUrl}/stats`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch order stats');
    }

    return await response.json();
  }
}
