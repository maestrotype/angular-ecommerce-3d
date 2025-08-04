import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Order } from '../../../models/order.model';
import { OrderService } from '../../../services/order.service';

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss']
})
export class OrderDetailComponent implements OnInit {
  order: Order | null = null;
  loading = true;
  error = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { orderId: number },
    private dialogRef: MatDialogRef<OrderDetailComponent>,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    this.loadOrderDetails();
  }

  loadOrderDetails(): void {
    this.loading = true;
    this.orderService.getOrder(this.data.orderId).subscribe({
      next: (order) => {
        this.order = order;
        this.loading = false;
        console.log('Order loaded:', order);
        console.log('Total amount:', order.totalAmount);
        console.log('Items:', order.items);
      },
      error: (error) => {
        this.error = 'Failed to load order details';
        this.loading = false;
        console.error('Error loading order details:', error);
      }
    });
  }

  updateOrderStatus(status: string): void {
    if (!this.order) return;

    this.orderService.updateOrderStatus(this.order.id, status).subscribe({
      next: (updatedOrder) => {
        this.order = updatedOrder;
      },
      error: (error) => {
        console.error('Error updating order status:', error);
      }
    });
  }

  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'var(--admin-order-status-pending)';
      case 'processing':
        return 'var(--admin-order-status-processing)';
      case 'shipped':
        return 'var(--admin-order-status-shipped)';
      case 'delivered':
        return 'var(--admin-order-status-delivered)';
      case 'cancelled':
        return 'var(--admin-order-status-cancelled)';
      default:
        return 'var(--admin-order-detail-text-secondary)';
    }
  }

  getTotalPrice(): number {
    if (!this.order?.items) return 0;
    return this.order.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  close(): void {
    this.dialogRef.close();
  }
} 