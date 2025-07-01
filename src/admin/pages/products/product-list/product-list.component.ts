
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Product } from 'src/shared/models/product.model';

@Component({
  selector: 'app-product-list',
  templateUrl: 'product-list.component.html',
  styleUrl: 'product-list.component.scss',
})
export class ProductListComponent implements OnInit {
  displayedColumns: string[] = ['id', 'name', 'category', 'price', 'stock', 'actions'];
  dataSource = new MatTableDataSource<Product>();
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Mock data - will be replaced with service calls
  products: Product[] = [
    {
      id: 1,
      name: 'Samsung Galaxy S23',
      category: 'Smartphones',
      price: 899.99,
      stock: 25,
      description: 'Latest Samsung flagship smartphone',
      specifications: { brand: 'Samsung', model: 'Galaxy S23' },
      imageUrl: '/placeholder.jpg'
    },
    {
      id: 2,
      name: 'iPhone 15 Pro',
      category: 'Smartphones',
      price: 1199.99,
      stock: 5,
      description: 'Apple iPhone 15 Pro',
      specifications: { brand: 'Apple', model: 'iPhone 15 Pro' },
      imageUrl: '/placeholder.jpg'
    },
    {
      id: 3,
      name: 'MacBook Air M2',
      category: 'Laptops',
      price: 1299.99,
      stock: 0,
      description: 'Apple MacBook Air with M2 chip',
      specifications: { brand: 'Apple', model: 'MacBook Air M2' },
      imageUrl: '/placeholder.jpg'
    }
  ];

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.dataSource.data = this.products;
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  addProduct(): void {
    this.router.navigate(['/admin/products/new']);
  }

  editProduct(productId: number): void {
    this.router.navigate(['/admin/products/edit', productId]);
  }

  deleteProduct(product: Product): void {
    if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
      // TODO: Implement actual delete logic with service
      const index = this.products.findIndex(p => p.id === product.id);
      if (index > -1) {
        this.products.splice(index, 1);
        this.dataSource.data = [...this.products];
        this.snackBar.open('Product deleted successfully', 'Close', {
          duration: 3000
        });
      }
    }
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  getStockClass(stock: number): string {
    if (stock === 0) return 'stock-low';
    if (stock < 10) return 'stock-medium';
    return 'stock-high';
  }
}
