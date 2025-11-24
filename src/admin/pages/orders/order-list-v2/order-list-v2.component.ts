import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { OrderService } from '../../../services/order.service';
import { OrderDetailComponent } from '../order-detail/order-detail.component';

export interface Order {
  id: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items: {
    productId: number;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }[];
  totalAmount: number;
  status: string;
  shippingAddress?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

@Component({
  selector: 'app-order-list-v2',
  templateUrl: './order-list-v2.component.html',
  styleUrls: ['./order-list-v2.component.scss']
})
export class OrderListV2Component implements OnInit {
  displayedColumns: string[] = ['id', 'customer', 'items', 'total', 'status', 'date', 'actions'];
  dataSource = new MatTableDataSource<Order>();
  isLoading = false;
  error: string | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private orderService: OrderService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
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
        console.error('Error loading orders:', error);
        this.error = 'Failed to load orders';
        this.snackBar.open('Error loading orders', 'Close', { duration: 3000 });
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
        this.snackBar.open('Order status updated successfully', 'Close', { duration: 3000 });
        this.loadOrders();
      },
      error: (error) => {
        console.error('Error updating order status:', error);
        this.snackBar.open('Error updating order status', 'Close', { duration: 3000 });
      }
    });
  }

  viewOrderDetails(order: Order): void {
    const dialogRef = this.dialog.open(OrderDetailComponent, {
      width: '900px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: { orderId: order.id }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Refresh orders list if needed
        this.loadOrders();
      }
    });
  }
}


