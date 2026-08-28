import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { AdminOrderService } from '../../../services/order.service';
import { OrderDetailComponent } from '../order-detail/order-detail.component';
import { Order } from '../../../models/order.model';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.scss']
})
export class OrderListComponent implements OnInit {
  displayedColumns: string[] = ['id', 'customer', 'items', 'total', 'status', 'date', 'actions'];
  dataSource = new MatTableDataSource<Order>();
  isLoading = false;
  error: string | null = null;
  searchTerm = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private orderService: AdminOrderService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadOrders(): void {
    this.isLoading = true;
    this.error = null;

    this.orderService.getOrders().subscribe({
      next: (orders) => {
        this.dataSource.data = orders;
        this.isLoading = false;
      },
      error: (error) => {
        
        this.error = this.translate.instant('ERROR_LOADING_ORDERS_MSG');
        this.snackBar.open(this.translate.instant('ERROR_LOADING_ORDERS_MSG'), this.translate.instant('CLOSE_BTN'), { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  applySearch(value: string): void {
    this.dataSource.filter = (value || '').trim().toLowerCase();
    this.dataSource.paginator?.firstPage();
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


