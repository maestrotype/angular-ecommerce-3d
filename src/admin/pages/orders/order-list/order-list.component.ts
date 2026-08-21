import { AfterViewInit, Component, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { OrderService } from '../../../services/order.service';
import { OrderDetailComponent } from '../order-detail/order-detail.component';
import { Order } from '../../../models/order.model';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.scss']
})
export class OrderListComponent implements OnInit, AfterViewInit, OnDestroy {
  displayedColumns: string[] = ['id', 'customer', 'items', 'total', 'status', 'date', 'actions'];
  dataSource = new MatTableDataSource<Order>();
  isLoading = false;
  error: string | null = null;
  pagedOrders: Order[] = [];

  @ViewChildren(MatPaginator) paginators!: QueryList<MatPaginator>;
  @ViewChild(MatSort) sort!: MatSort;

  private paginatorSub?: Subscription;
  private pageSub?: Subscription;

  constructor(
    private orderService: OrderService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.bindActivePaginator();
    this.paginatorSub = this.paginators.changes.subscribe(() => this.bindActivePaginator());
  }

  ngOnDestroy(): void {
    this.paginatorSub?.unsubscribe();
    this.pageSub?.unsubscribe();
  }

  private bindActivePaginator(): void {
    const paginators = this.paginators?.toArray() ?? [];
    if (!paginators.length) {
      return;
    }

    const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;
    // Desktop table paginator is first; mobile-paginator is last when both exist.
    const paginator = isMobile ? paginators[paginators.length - 1] : paginators[0];

    this.dataSource.paginator = paginator;
    this.pageSub?.unsubscribe();
    this.pageSub = paginator.page.subscribe(() => this.refreshPagedOrders());
    this.refreshPagedOrders();
  }

  private refreshPagedOrders(): void {
    const filtered = this.dataSource.filteredData ?? this.dataSource.data ?? [];
    const paginator = this.dataSource.paginator;
    if (!paginator) {
      this.pagedOrders = filtered;
      return;
    }
    const start = paginator.pageIndex * paginator.pageSize;
    this.pagedOrders = filtered.slice(start, start + paginator.pageSize);
  }

  loadOrders(): void {
    this.isLoading = true;
    this.error = null;

    this.orderService.getOrders().subscribe({
      next: (orders) => {
        this.dataSource.data = orders;
        this.isLoading = false;
        queueMicrotask(() => {
          this.bindActivePaginator();
          this.refreshPagedOrders();
        });
      },
      error: () => {
        this.error = this.translate.instant('ERROR_LOADING_ORDERS_MSG');
        this.snackBar.open(this.translate.instant('ERROR_LOADING_ORDERS_MSG'), this.translate.instant('CLOSE_BTN'), { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
    this.refreshPagedOrders();
  }

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'pending': return 'status-pending';
      case 'confirmed': return 'status-confirmed';
      case 'processing': return 'status-processing';
      case 'shipped': return 'status-shipped';
      case 'delivered': return 'status-delivered';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-pending';
    }
  }

  getItemsDisplay(items: any[]): string {
    if (!items || items.length === 0) return 'No items';
    
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const itemNames = items.slice(0, 2).map(item => item.name).join(', ');
    
    if (items.length > 2) {
      return `${itemNames} (+${items.length - 2} more) - ${totalItems} items`;
    }
    
    return `${itemNames} - ${totalItems} items`;
  }

  updateOrderStatus(order: Order, newStatus: string): void {
    this.orderService.updateOrderStatus(order.id, newStatus).subscribe({
      next: () => {
        this.snackBar.open(this.translate.instant('ORDER_STATUS_UPDATED'), this.translate.instant('CLOSE_BTN'), { duration: 3000 });
        this.loadOrders();
      },
      error: (error) => {
        
        this.snackBar.open(this.translate.instant('ERROR_UPDATING_ORDER_STATUS'), this.translate.instant('CLOSE_BTN'), { duration: 3000 });
      }
    });
  }

  viewOrderDetails(order: Order): void {
    const dialogRef = this.dialog.open(OrderDetailComponent, {
      width: '1080px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      autoFocus: false,
      panelClass: 'order-detail-dialog',
      data: { orderId: order.id, order }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Refresh orders list if needed
        this.loadOrders();
      }
    });
  }
}


