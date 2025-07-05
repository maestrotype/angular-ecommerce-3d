
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OrderService } from '../../../services/order.service';

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
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.scss']
})
export class OrderListComponent implements OnInit {
  displayedColumns: string[] = ['id', 'customer', 'items', 'total', 'status', 'date', 'actions'];
  dataSource = new MatTableDataSource<Order>();
  isLoading = false;
  error: string | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private orderService: OrderService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  async loadOrders(): Promise<void> {
    this.isLoading = true;
    this.error = null;

    try {
      const orders = await this.orderService.getOrders();
      this.dataSource.data = orders;
    } catch (error) {
      console.error('Error loading orders:', error);
      this.error = 'Failed to load orders';
      this.snackBar.open('Error loading orders', 'Close', { duration: 3000 });
    } finally {
      this.isLoading = false;
    }
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

  async updateOrderStatus(order: Order, newStatus: string): Promise<void> {
    try {
      await this.orderService.updateOrderStatus(order.id, newStatus);
      this.snackBar.open('Order status updated successfully', 'Close', { duration: 3000 });
      await this.loadOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      this.snackBar.open('Error updating order status', 'Close', { duration: 3000 });
    }
  }

  viewOrderDetails(order: Order): void {
    // Implement order details view
    console.log('View order details:', order);
  }
}
