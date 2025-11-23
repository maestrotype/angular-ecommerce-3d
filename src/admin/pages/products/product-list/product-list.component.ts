import { Component, OnInit, ViewChild } from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { Product } from "../../../models/product.model";
import { ProductService } from "../../../services/product.service";
import { ConfirmationService } from "../../../services/confirmation.service";
import { ErrorHandlerService } from "../../../services/error-handler.service";
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: "app-product-list",
  templateUrl: "./product-list.component.html",
  styleUrls: ["./product-list.component.scss"],
})
export class ProductListComponent implements OnInit {
  displayedColumns: string[] = [
    "id",
    "image",
    "name",
    "category",
    "price",
    "stock",
    "actions",
  ];
  dataSource = new MatTableDataSource<Product>([]);
  isLoading = false;
  error: string | null = null;
  allProducts: Product[] = [];
  searchTerm = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private productService: ProductService,
    private confirmationService: ConfirmationService,
    private errorHandler: ErrorHandlerService,
    private translate: TranslateService
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
        this.allProducts = products;
        this.dataSource.data = products;
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Error loading products:", err);
        this.error = "Failed to load products. Please try again.";
        this.isLoading = false;
        this.errorHandler.showError({
          title: this.translate.instant('ERROR_LOADING'),
          message: this.translate.instant('ERROR_LOADING_PRODUCTS'),
          type: 'error'
        });
      },
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
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  filterByCategory(event: any): void {
    const category = event.value;
    if (category) {
      this.dataSource.data = this.allProducts.filter(
        (p) => p.category === category
      );
    } else {
      this.dataSource.data = this.allProducts;
    }
  }

  addProduct(): void {
    this.router.navigate(["/admin/products/new"]);
  }

  editProduct(product: Product): void {
    this.router.navigate(["/admin/products/edit", product.id]);
  }

  deleteProduct(product: Product): void {
    this.confirmationService.confirmDelete(product.name).subscribe(confirmed => {
      if (confirmed) {
        this.productService.deleteProduct(product.id).subscribe({
          next: () => {
            this.errorHandler.showSuccess(this.translate.instant('PRODUCT_DELETED_SUCCESS'));
            this.loadProducts();
          },
          error: (error) => {
            this.errorHandler.showError({
              title: this.translate.instant('ERROR'),
              message: this.translate.instant('ERROR_DELETING_PRODUCT'),
              type: 'error'
            });
          },
        });
      }
    });
  }

  getStockClass(stock: number | undefined): string {
    if (!stock) return "stock-low";
    if (stock < 10) return "stock-low";
    if (stock < 50) return "stock-medium";
    return "stock-high";
  }

  hasValidImage(product: Product): boolean {
    return !!(
      product.imageUrl &&
      product.imageUrl.trim() !== "" &&
      !product.imageUrl.includes("placeholder")
    );
  }

  getImageUrl(product: Product): string {
    // Return the imageUrl directly if it exists and is not a placeholder
    if (
      product.imageUrl &&
      product.imageUrl.trim() !== "" &&
      !product.imageUrl.includes("placeholder")
    ) {
      return product.imageUrl;
    }

    if (product.images && product.images.length > 0) {
      const firstImage = product.images[0];
      if (
        firstImage &&
        firstImage.trim() !== "" &&
        !firstImage.includes("placeholder")
      ) {
        return firstImage;
      }
    }

    // Return empty string if no valid image found
    return "";
  }

  onImageError(event: any, product: any): void {
    // Handle image error silently
  }
}
