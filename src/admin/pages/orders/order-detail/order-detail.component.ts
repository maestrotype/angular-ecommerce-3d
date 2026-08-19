import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Order, OrderItem } from '../../../models/order.model';
import { OrderService } from '../../../services/order.service';
import { TranslateService } from '@ngx-translate/core';
import { fixBackendUrl } from '../../../../app/core/utils/url-helper';

export interface OrderDetailDialogData {
  orderId: number;
  order?: Order;
}

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss']
})
export class OrderDetailComponent implements OnInit {
  readonly statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'] as const;

  order: Order | null = null;
  selectedStatus = 'pending';
  loading = true;
  saving = false;
  statusSaved = false;
  error = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: OrderDetailDialogData,
    private dialogRef: MatDialogRef<OrderDetailComponent>,
    private orderService: OrderService,
    private snackBar: MatSnackBar,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    if (this.data.order) {
      this.applyOrder(this.data.order);
      this.loading = false;
    }
    this.loadOrderDetails();
  }

  get hasStatusChanged(): boolean {
    return !!this.order && this.selectedStatus !== this.order.status;
  }

  loadOrderDetails(): void {
    const orderId = this.data.orderId || this.data.order?.id;
    if (!orderId) {
      this.error = this.translate.instant('ERROR_LOADING_ORDERS_MSG');
      this.loading = false;
      return;
    }

    if (!this.order) {
      this.loading = true;
    }
    this.error = '';

    this.orderService.getOrder(orderId).subscribe({
      next: (order) => {
        this.applyOrder(order);
        this.loading = false;
      },
      error: () => {
        this.error = this.translate.instant('ERROR_LOADING_ORDERS_MSG');
        this.loading = false;
      }
    });
  }

  saveStatus(): void {
    if (!this.order || !this.hasStatusChanged || this.saving) {
      return;
    }

    this.saving = true;
    this.orderService.updateOrderStatus(this.order.id, this.selectedStatus).subscribe({
      next: (updatedOrder) => {
        this.applyOrder(updatedOrder);
        this.saving = false;
        this.statusSaved = true;
        this.snackBar.open(
          this.translate.instant('ORDER_STATUS_UPDATED'),
          this.translate.instant('CLOSE_BTN'),
          { duration: 3000 }
        );
      },
      error: () => {
        this.saving = false;
        this.snackBar.open(
          this.translate.instant('ERROR_UPDATING_ORDER_STATUS'),
          this.translate.instant('CLOSE_BTN'),
          { duration: 3000 }
        );
      }
    });
  }

  statusClass(status?: string): string {
    switch ((status || '').toLowerCase()) {
      case 'pending':
        return 'status-pending';
      case 'confirmed':
      case 'processing':
        return 'status-processing';
      case 'shipped':
      case 'delivered':
        return 'status-delivered';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return 'status-pending';
    }
  }

  statusKey(status?: string): string {
    return (status || 'pending').toUpperCase();
  }

  statusIcon(status?: string): string {
    switch ((status || '').toLowerCase()) {
      case 'confirmed':
        return 'check_circle';
      case 'processing':
        return 'autorenew';
      case 'shipped':
        return 'local_shipping';
      case 'delivered':
        return 'done_all';
      case 'cancelled':
        return 'cancel';
      default:
        return 'schedule';
    }
  }

  display(value?: string | null): string {
    const trimmed = (value || '').trim();
    return trimmed || this.translate.instant('VALUE_UNAVAILABLE');
  }

  formatPayment(value?: string | null): string {
    const raw = (value || '').trim();
    if (!raw) {
      return this.translate.instant('VALUE_UNAVAILABLE');
    }
    const labels: Record<string, string> = {
      stripe: 'Stripe',
      paypal: 'PayPal',
      card: 'Card',
      cash: 'Cash',
      cod: 'Cash on delivery',
    };
    return labels[raw.toLowerCase()] || raw.charAt(0).toUpperCase() + raw.slice(1);
  }

  itemImage(item: OrderItem): string {
    return fixBackendUrl(item.image);
  }

  lineTotal(item: OrderItem): number {
    return Number(item.price) * Number(item.quantity);
  }

  getSubtotal(): number {
    if (!this.order?.items?.length) {
      return 0;
    }
    return this.order.items.reduce((sum, item) => sum + this.lineTotal(item), 0);
  }

  getOrderTotal(): number {
    const stored = Number(this.order?.totalAmount);
    if (!Number.isNaN(stored) && stored > 0) {
      return stored;
    }
    return this.getSubtotal();
  }

  shippingLine(): string {
    if (!this.order) {
      return this.translate.instant('VALUE_UNAVAILABLE');
    }
    const parts = this.uniqueAddressParts([
      this.order.shippingAddress,
      this.order.city,
      this.order.postalCode,
      this.order.country,
    ]);
    return parts.length ? parts.join(', ') : this.translate.instant('VALUE_UNAVAILABLE');
  }

  close(): void {
    this.dialogRef.close(this.statusSaved);
  }

  private applyOrder(order: Order): void {
    this.order = order;
    this.selectedStatus = order.status || 'pending';
  }

  private uniqueAddressParts(values: Array<string | undefined>): string[] {
    const result: string[] = [];

    for (const value of values) {
      const pieces = (value || '')
        .split(',')
        .map((piece) => this.collapseRepeatedText(piece.trim()))
        .filter(Boolean);

      for (const piece of pieces) {
        const key = piece.toLowerCase();
        const duplicate = result.some((existing) => {
          const existingKey = existing.toLowerCase();
          return existingKey === key || existingKey.includes(key) || key.includes(existingKey);
        });
        if (!duplicate) {
          result.push(piece);
        }
      }
    }

    return result;
  }

  private collapseRepeatedText(value: string): string {
    const doubled = value.match(/^(.*)\1$/i);
    return doubled ? doubled[1].trim() : value;
  }
}
