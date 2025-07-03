import { Component, OnInit, ViewChild } from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { Product } from "../../../models/product.model";
import { ProductService } from "../../../services/product.service";

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
        console.log("Products loaded:", products);
        this.allProducts = products;
        this.dataSource.data = products;
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Error loading products:", err);
        this.error = "Failed to load products. Please try again.";
        this.isLoading = false;
        this.snackBar.open("Error loading products", "Close", {
          duration: 5000,
        });
      },
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
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
    if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
      this.productService.deleteProduct(product.id).subscribe({
        next: () => {
          this.snackBar.open("Product deleted successfully", "Close", {
            duration: 3000,
          });
          this.loadProducts();
        },
        error: (err) => {
          console.error("Error deleting product:", err);
          this.snackBar.open("Error deleting product", "Close", {
            duration: 5000,
          });
        },
      });
    }
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

  onImageError(event: any, product: Product): void {
    console.log('Image error for product:', product.name, 'URL:', event.target.src);
    // Hide the broken image and show placeholder
    event.target.style.display = 'none';
    const placeholderDiv = event.target.parentElement.querySelector('.no-image-placeholder');
    if (placeholderDiv) {
      placeholderDiv.style.display = 'flex';
    }
  }
}
