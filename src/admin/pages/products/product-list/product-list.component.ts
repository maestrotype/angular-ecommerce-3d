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

  getImageUrl(product: Product): string {
    // Сначала проверяем imageUrl
    if (product.imageUrl && product.imageUrl.trim() !== "") {
      return product.imageUrl;
    }

    // Потом проверяем массив images
    if (product.images && product.images.length > 0) {
      const firstImage = product.images[0];
      if (firstImage && firstImage.trim() !== "") {
        return firstImage;
      }
    }

    // Если нет изображения, возвращаем null для обработки в шаблоне
    return null;
  }

  onImageError(event: any, product: Product): void {
    console.log(
      "Image error for product:",
      product.name,
      "URL:",
      event.target.src
    );

    event.target.style.display = "none";
    const sibling = event.target.nextElementSibling as HTMLElement | null;
    if (sibling) {
      sibling.style.display = "flex";
    }
  }
}
