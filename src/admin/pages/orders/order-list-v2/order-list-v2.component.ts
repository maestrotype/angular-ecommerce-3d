import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { OrderService } from '../../../services/order.service';
import { OrderDetailComponent } from '../order-detail/order-detail.component';

@Component({
  selector: 'app-order-list-v2',
  templateUrl: './order-list-v2.component.html',
  styleUrls: ['./order-list-v2.component.scss']
})
export class OrderListV2Component implements OnInit {
  displayedColumns: string[] = ['id', 'customer', 'items', 'total', 'status', 'date', 'actions'];
  dataSource = new MatTableDataSource<any>();
  isLoading = false;
  error: string | null = null;
  searchTerm = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private orderService: OrderService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void { this.loadOrders(); }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadOrders(): void {
    this.isLoading = true;
    this.error = null;
    this.orderService.getOrders().subscribe({
      next: (orders) => { this.dataSource.data = orders; this.isLoading = false; },
      error: (err) => { this.error = 'Failed to load orders'; this.snackBar.open('Error loading orders', 'Close', { duration: 3000 }); this.isLoading = false; }
    });
  }

  onSearch(): void {
    this.dataSource.filter = this.searchTerm.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.dataSource.filter = '';
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.searchTerm = filterValue.trim();
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
  }

  getItemsDisplay(items: any[]): string {
    if (!items || items.length === 0) return 'No items';
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const itemNames = items.slice(0, 2).map(item => item.name).join(', ');
    return items.length > 2 ? `${itemNames} (+${items.length - 2} more) - ${totalItems} items` : `${itemNames} - ${totalItems} items`;
  }

  getStatusClass(status: string): string {
    switch ((status || '').toLowerCase()) {
      case 'pending': return 'status-pending';
      case 'confirmed': return 'status-confirmed';
      case 'processing': return 'status-processing';
      case 'shipped': return 'status-shipped';
      case 'delivered': return 'status-delivered';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-pending';
    }
  }

  updateOrderStatus(order: any, newStatus: string): void {
    this.orderService.updateOrderStatus(order.id, newStatus).subscribe({
      next: () => { this.snackBar.open('Order status updated successfully', 'Close', { duration: 3000 }); this.loadOrders(); },
      error: () => { this.snackBar.open('Error updating order status', 'Close', { duration: 3000 }); }
    });
  }

  viewOrderDetails(order: any): void {
    const ref = this.dialog.open(OrderDetailComponent, { width: '900px', maxWidth: '95vw', maxHeight: '90vh', data: { orderId: order.id } });
    ref.afterClosed().subscribe(res => { if (res) this.loadOrders(); });
  }
}


