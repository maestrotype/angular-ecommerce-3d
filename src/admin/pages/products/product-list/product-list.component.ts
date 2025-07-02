
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Product } from 'src/shared/models/product.model';
import { ProductService } from '../../../services/product.service';
@Component({
  selector: 'app-product-list',
  templateUrl: 'product-list.component.html',
  styleUrl: 'product-list.component.scss',
})
export class ProductListComponent implements OnInit {
  displayedColumns: string[] = ['id', 'name', 'category', 'price', 'stock', 'actions'];
  dataSource = new MatTableDataSource<Product>();
  isLoading = false;
  error: string | null = null;
  allProducts: Product[] = [];
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadProducts(): void {
    this.isLoading = true;
    this.error = null;
    
    this.productService.getAllProducts().subscribe({
      next: (products) => {
        console.log('Products loaded:', products);
        this.allProducts = products;
        this.dataSource.data = products;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.error = 'Failed to load products. Please try again.';
        this.isLoading = false;
        this.snackBar.open('Error loading products', 'Close', { duration: 5000 });
      }
    });
  }

  filterByCategory(event: any): void {
    const category = event.value;
    if (category) {
      this.dataSource.data = this.allProducts.filter(p => p.category === category);
    } else {
      this.dataSource.data = this.allProducts;
    }
  }

  addProduct(): void {
    this.router.navigate(['/admin/products/new']);
  }

  editProduct(productId: number): void {
    this.router.navigate(['/admin/products/edit', productId]);
  }

  deleteProduct(product: Product): void {
    if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
      this.productService.deleteProduct(product.id).subscribe({
        next: () => {
          this.snackBar.open('Product deleted successfully', 'Close', { duration: 3000 });
          this.loadProducts(); // Reload the list
        },
        error: (err) => {
          console.error('Error deleting product:', err);
          this.snackBar.open('Error deleting product', 'Close', { duration: 5000 });
        }
      });
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
