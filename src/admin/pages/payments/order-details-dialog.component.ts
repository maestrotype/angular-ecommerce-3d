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
    this.http.get<{ success: boolean; data: OrderDetails; message?: string }>(`${environment.apiUrl}/orders/${this.data.orderId}`).pipe(
      map(response => {
        console.log('[OrderDetailsDialog] Orders endpoint response:', response);
        return response.success ? response.data : null;
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
                id: this.data.orderId,
                orderNumber: `ORDER-${this.data.orderId}`,
                status: payment.status || 'pending',
                totalAmount: payment.amount || 0,
                currency: payment.currency || 'USD',
                customerEmail: payment.customerEmail || 'N/A',
                customerPhone: payment.customerPhone || 'N/A',
                customerName: payment.customerEmail ? payment.customerEmail.split('@')[0] : 'N/A',
                shippingAddress: 'Address not available',
                billingAddress: 'Address not available',
                items: [{
                  id: 1,
                  productId: this.data.orderId,
                  productName: `Product for Order #${this.data.orderId}`,
                  quantity: 1,
                  unitPrice: payment.amount || 0,
                  totalPrice: payment.amount || 0
                }],
                createdAt: payment.createdAt || new Date().toISOString(),
                updatedAt: payment.updatedAt || new Date().toISOString(),
                notes: `Order created from payment #${payment.id}`
              };
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
