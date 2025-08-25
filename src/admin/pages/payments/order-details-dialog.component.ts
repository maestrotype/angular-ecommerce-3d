import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';

export interface OrderDetails {
  id: number;
  orderNumber: string;
  status: string;
  totalAmount: number;
  currency: string;
  customerEmail: string;
  customerPhone: string;
  customerName: string;
  shippingAddress: string;
  billingAddress: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

@Component({
  selector: 'app-order-details-dialog',
  templateUrl: './order-details-dialog.component.html',
  styleUrls: ['./order-details-dialog.component.scss']
})
export class OrderDetailsDialogComponent {
  orderDetails: OrderDetails | null = null;
  isLoading = true;
  error: string | null = null;

  constructor(
    public dialogRef: MatDialogRef<OrderDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { orderId: number },
    private http: HttpClient
  ) {
    this.loadOrderDetails();
  }

  close(): void {
    this.dialogRef.close();
  }

  private loadOrderDetails(): void {
    this.isLoading = true;
    this.error = null;

    // Try to get order details from orders endpoint first
    this.http.get<{ success: boolean; data: any; message?: string }>(`${environment.apiUrl}/orders/${this.data.orderId}`).pipe(
      map(response => {
        // Orders endpoint returns our Order entity. Map it to OrderDetails shape with safe defaults.
        const order = response && response.success ? response.data : null;
        if (!order) return null;
        return this.mapOrderToDetails(order);
      }),
      catchError(error => {
        console.error('Failed to load order details from orders endpoint:', error);
        // If orders endpoint fails, try to get from payments endpoint
        return this.http.get<{ success: boolean; data: any[]; message?: string }>(`${environment.apiUrl}/payments/order/${this.data.orderId}`).pipe(
          map(paymentResponse => {
            console.log('[OrderDetailsDialog] Payments endpoint response:', paymentResponse);
            if (paymentResponse.success && paymentResponse.data.length > 0) {
              const payment = paymentResponse.data[0];
              // Create mock order details from payment data
              return {
                id: Number(this.data.orderId),
                orderNumber: `ORDER-${this.data.orderId}`,
                status: payment.status || 'pending',
                totalAmount: Number(payment.amount) || 0,
                currency: payment.currency || 'USD',
                customerEmail: payment.customerEmail || 'N/A',
                customerPhone: payment.customerPhone || 'N/A',
                customerName: payment.customerEmail ? payment.customerEmail.split('@')[0] : 'N/A',
                shippingAddress: 'Address not available',
                billingAddress: 'Address not available',
                items: [{
                  id: 1,
                  productId: Number(this.data.orderId),
                  productName: `Product for Order #${this.data.orderId}`,
                  quantity: 1,
                  unitPrice: Number(payment.amount) || 0,
                  totalPrice: Number(payment.amount) || 0
                }],
                createdAt: payment.createdAt || new Date().toISOString(),
                updatedAt: payment.updatedAt || new Date().toISOString(),
                notes: `Order created from payment #${payment.id}`
              } as OrderDetails;
            }
            return null;
          }),
          catchError(paymentError => {
            console.error('Failed to load order details from payments endpoint:', paymentError);
            return of(null);
          })
        );
      })
    ).subscribe({
      next: (order) => {
        this.orderDetails = order;
        this.isLoading = false;
        if (!order) {
          this.error = 'Order details not found';
        }
      },
      error: (error) => {
        this.error = 'Failed to load order details';
        this.isLoading = false;
      }
    });
  }

  private mapOrderToDetails(order: any): OrderDetails {
    const items = Array.isArray(order.items)
      ? order.items.map((it: any, idx: number) => ({
          id: idx + 1,
          productId: Number(it.productId) || 0,
          productName: String(it.name || `Product ${idx + 1}`),
          quantity: Number(it.quantity) || 0,
          unitPrice: Number(it.price) || 0,
          totalPrice: (Number(it.price) || 0) * (Number(it.quantity) || 0),
        }))
      : [];

    return {
      id: Number(order.id) || this.data.orderId,
      orderNumber: order.orderNumber || `ORDER-${order.id}`,
      status: order.status || 'pending',
      totalAmount: Number(order.totalAmount) || 0,
      currency: order.currency || 'USD',
      customerEmail: order.customerEmail || 'N/A',
      customerPhone: order.customerPhone || 'N/A',
      customerName: order.customerName || 'N/A',
      shippingAddress: order.shippingAddress || [order.city, order.postalCode, order.country].filter(Boolean).join(', ') || 'N/A',
      billingAddress: order.billingAddress || 'N/A',
      items,
      createdAt: (order.createdAt && new Date(order.createdAt).toISOString()) || new Date().toISOString(),
      updatedAt: (order.updatedAt && new Date(order.updatedAt).toISOString()) || new Date().toISOString(),
      notes: order.notes || undefined,
    } as OrderDetails;
  }

  formatDate(date: string | Date): string {
    if (!date) return 'N/A';
    const dateObj = new Date(date);
    return isNaN(dateObj.getTime()) ? 'Invalid Date' : dateObj.toLocaleString('ru-RU');
  }

  getStatusColor(status: string): string {
    switch (status?.toLowerCase()) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      case 'processing': return 'info';
      case 'shipped': return 'primary';
      case 'delivered': return 'success';
      default: return 'default';
    }
  }

  getStatusIcon(status: string): string {
    switch (status?.toLowerCase()) {
      case 'confirmed': return 'check_circle';
      case 'pending': return 'schedule';
      case 'cancelled': return 'cancel';
      case 'processing': return 'sync';
      case 'shipped': return 'local_shipping';
      case 'delivered': return 'done_all';
      default: return 'help';
    }
  }

  formatCurrency(amount: number, currency: string): string {
    return `${amount.toFixed(2)} ${currency}`;
  }

  getSafeValue(value: any, defaultValue: string = 'N/A'): string {
    return value ? value : defaultValue;
  }
}
