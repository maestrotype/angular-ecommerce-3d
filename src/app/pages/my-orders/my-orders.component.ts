import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { environment } from 'src/environments/environment';

type OrderItem = {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
};

type OrderDto = {
  id: number;
  createdAt: string;
  status?: string;
  items?: OrderItem[];
  totalAmount?: number;
};

@Component({
  selector: 'app-my-orders',
  templateUrl: './my-orders.component.html',
  styleUrls: ['./my-orders.component.scss']
})
export class MyOrdersComponent implements OnInit, OnDestroy {
  orders: OrderDto[] = [];
  isLoading = false;
  error: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadOrders(): void {
    this.isLoading = true;
    this.error = null;

    // Note: backend currently exposes GET /orders (no auth-scoping). We use it for client preview.
    this.http.get<{ success?: boolean; data?: OrderDto[] } | OrderDto[]>(`${environment.apiUrl}/orders`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          const data = Array.isArray(res) ? res : (res?.data ?? []);
          this.orders = (data || []).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          this.isLoading = false;
        },
        error: () => {
          this.error = 'Failed to load orders. Please try again later.';
          this.isLoading = false;
        }
      });
  }

  getItemsCount(order: OrderDto): number {
    return (order.items || []).reduce((sum, it) => sum + Number(it.quantity || 0), 0);
  }

  getTotal(order: OrderDto): number {
    if (typeof order.totalAmount === 'number') return order.totalAmount;
    return (order.items || []).reduce((sum, it) => sum + Number(it.price || 0) * Number(it.quantity || 0), 0);
  }

  getStatusLabel(status?: string): string {
    if (!status) return 'pending';
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  }

  goShop(): void {
    this.router.navigate(['/shop']);
  }
}


