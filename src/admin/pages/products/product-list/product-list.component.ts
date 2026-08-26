import { Component, OnInit } from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { PageEvent } from "@angular/material/paginator";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { Product } from "../../../models/product.model";
import { ProductService } from "../../../services/product.service";
import { ConfirmationService } from "../../../services/confirmation.service";
import { ErrorHandlerService } from "../../../services/error-handler.service";
import { CategoryService } from "../../../services/category.service";
import { Category } from "../../../models/category.model";
import { TranslateService } from '@ngx-translate/core';
import { SettingsService } from '../../../services/settings.service';
import { AdminCatalogSort, CatalogDisplaySettings } from '../../../../shared/utils/shop-catalog.util';

export type CatalogSort = AdminCatalogSort;
export type StockTone = 'out' | 'low' | 'ok';

@Component({
  selector: "app-product-list",
  templateUrl: "./product-list.component.html",
  styleUrls: ["./product-list.component.scss"],
})
export class ProductListComponent implements OnInit {
  dataSource = new MatTableDataSource<Product>([]);
  isLoading = false;
  error: string | null = null;
  allProducts: Product[] = [];
  categories: Category[] = [];
  searchTerm = '';
  catalogSort: CatalogSort = 'newest';
  selectedCategorySlugs: string[] = [];
  shopDisplayActive = false;
  bestSellersDisplayActive = false;
  isSavingShopDisplay = false;
  isSavingBestSellersDisplay = false;
  pageIndex = 0;
  pageSize = 10;
  pageSizeOptions = [10, 20, 50];

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private productService: ProductService,
    private categoryService: CategoryService,
    private confirmationService: ConfirmationService,
    private errorHandler: ErrorHandlerService,
    private translate: TranslateService,
    private settingsService: SettingsService,
  ) { }

  ngOnInit(): void {
    this.dataSource.filterPredicate = (product, filter) =>
      this.matchesProductFilter(product, filter);
    this.loadProducts();
    this.loadCategories();
    this.loadStorefrontDisplaySettings();
  }

  get filteredCount(): number {
    return this.dataSource.filteredData.length;
  }

  get catalogProducts(): Product[] {
    const sorted = this.sortProducts([...this.dataSource.filteredData]);
    const start = this.pageIndex * this.pageSize;
    return sorted.slice(start, start + this.pageSize);
  }

  loadProducts(): void {
    this.isLoading = true;
    this.error = null;

    this.productService.getAllProducts().subscribe({
      next: (products) => {
        this.allProducts = products;
        this.dataSource.data = products;
        this.resetPage();
        this.isLoading = false;
      },
      error: (err) => {

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

  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.applyCategoryFilter();
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  get storefrontPreviewCount(): number {
    return this.dataSource.filteredData.length;
  }

  get selectedCategoryLabels(): string[] {
    const lang = this.translate.currentLang || 'en';
    return this.selectedCategorySlugs.map((slug) => {
      const name = this.getCategoryNameBySlug(slug);
      if (typeof name === 'string') {
        return name;
      }
      if (name && typeof name === 'object') {
        return name[lang] || name.en || slug;
      }
      return slug;
    });
  }

  loadStorefrontDisplaySettings(): void {
    this.settingsService.getShopCatalogSettings().subscribe({
      next: (settings) => {
        this.shopDisplayActive = settings.enabled;
        if (settings.enabled) {
          this.selectedCategorySlugs = [...settings.categories];
          this.catalogSort = settings.sortOrder;
          this.applyCategoryFilter();
        }
      },
    });

    this.settingsService.getBestSellersCatalogSettings().subscribe({
      next: (settings) => {
        this.bestSellersDisplayActive = settings.enabled;
      },
    });
  }

  private buildDisplaySettings(): CatalogDisplaySettings {
    return {
      enabled: true,
      categories: [...this.selectedCategorySlugs],
      sortOrder: this.catalogSort,
    };
  }

  saveShopDisplay(): void {
    this.isSavingShopDisplay = true;
    this.settingsService.updateShopCatalogSettings(this.buildDisplaySettings()).subscribe({
      next: () => {
        this.shopDisplayActive = true;
        this.isSavingShopDisplay = false;
        this.errorHandler.showSuccess(this.translate.instant('SHOP_DISPLAY_SAVED'));
      },
      error: () => {
        this.isSavingShopDisplay = false;
        this.errorHandler.showError({
          title: this.translate.instant('ERROR'),
          message: this.translate.instant('SHOP_DISPLAY_SAVE_ERROR'),
          type: 'error',
        });
      },
    });
  }

  saveBestSellersDisplay(): void {
    this.isSavingBestSellersDisplay = true;
    this.settingsService.updateBestSellersCatalogSettings(this.buildDisplaySettings()).subscribe({
      next: () => {
        this.bestSellersDisplayActive = true;
        this.isSavingBestSellersDisplay = false;
        this.errorHandler.showSuccess(this.translate.instant('BEST_SELLERS_DISPLAY_SAVED'));
      },
      error: () => {
        this.isSavingBestSellersDisplay = false;
        this.errorHandler.showError({
          title: this.translate.instant('ERROR'),
          message: this.translate.instant('BEST_SELLERS_DISPLAY_SAVE_ERROR'),
          type: 'error',
        });
      },
    });
  }

  onSearch(): void {
    this.dataSource.filter = this.searchTerm.trim().toLowerCase();
    this.resetPage();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.dataSource.filter = '';
    this.resetPage();
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.searchTerm = filterValue.trim();
    this.dataSource.filter = filterValue.trim().toLowerCase();
    this.resetPage();
  }

  onCatalogSortChange(): void {
    this.resetPage();
  }

  onPage(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  getCategoryValue(category: any): string {
    if (!category) return '';
    const name = typeof category.name === 'string'
      ? category.name
      : category.name.en || '';
    return category.slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }

  getCategoryNameBySlug(slug: string): any {
    const category = this.categories.find(c => this.getCategoryValue(c) === slug);
    return category ? category.name : slug;
  }

  filterByCategories(): void {
    this.applyCategoryFilter();
  }

  private applyCategoryFilter(): void {
    if (this.selectedCategorySlugs.length === 0) {
      this.dataSource.data = this.allProducts;
    } else {
      this.dataSource.data = this.allProducts.filter((product) =>
        this.productMatchesCategorySlugs(product.category || '', this.selectedCategorySlugs)
      );
    }
    this.resetPage();
  }

  private productMatchesCategorySlugs(productCategory: string, slugs: string[]): boolean {
    const normalizedProduct = this.normalizeCategoryRef(productCategory);
    return slugs.some((slug) => {
      const normalizedSlug = this.normalizeCategoryRef(slug);
      if (normalizedProduct === normalizedSlug) {
        return true;
      }
      const categoryName = this.asSearchText(this.getCategoryNameBySlug(slug));
      return this.normalizeCategoryRef(categoryName) === normalizedProduct;
    });
  }

  private normalizeCategoryRef(value: string): string {
    return value.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }

  addProduct(): void {
    this.router.navigate(["/admin/products/new"]);
  }

  editProduct(product: Product, event?: Event): void {
    event?.stopPropagation();
    this.router.navigate(["/admin/products/edit", product.id]);
  }

  deleteProduct(product: Product, event?: Event): void {
    event?.stopPropagation();
    const productName = typeof product.name === 'string'
      ? product.name
      : (product.name['en'] || Object.values(product.name)[0] || 'Product');

    this.confirmationService.confirmDelete(productName).subscribe(confirmed => {
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

  stockTone(stock: number | undefined): StockTone {
    if (stock == null || stock <= 0) return 'out';
    if (stock < 10) return 'low';
    return 'ok';
  }

  hasValidImage(product: Product): boolean {
    return !!(
      product.imageUrl &&
      product.imageUrl.trim() !== "" &&
      !product.imageUrl.includes("placeholder")
    );
  }

  getImageUrl(product: Product): string {
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

    return "";
  }

  onImageError(event: any, product: any): void {
    // Handle image error silently
  }

  trackByProductId(_index: number, product: Product): number {
    return product.id;
  }

  private resetPage(): void {
    this.pageIndex = 0;
  }

  private matchesProductFilter(product: Product, filter: string): boolean {
    if (!filter) return true;
    const haystack = [
      this.displayName(product),
      this.asSearchText(product.name),
      String(product.id ?? ''),
      product.category || '',
      this.asSearchText(this.getCategoryNameBySlug(product.category)),
    ].join(' ').toLowerCase();
    return haystack.includes(filter);
  }

  private sortProducts(products: Product[]): Product[] {
    switch (this.catalogSort) {
      case 'name':
        return products.sort((a, b) =>
          this.displayName(a).localeCompare(this.displayName(b), undefined, { sensitivity: 'base' })
        );
      case 'price':
        return products.sort((a, b) => (a.price || 0) - (b.price || 0));
      case 'stock':
        return products.sort((a, b) => (a.stock || 0) - (b.stock || 0));
      default:
        return products.sort((a, b) => {
          const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          if (timeA !== timeB) return timeB - timeA;
          return (b.id || 0) - (a.id || 0);
        });
    }
  }

  private displayName(product: Product): string {
    const name = product.name;
    if (!name) return '';
    if (typeof name === 'string') return name;
    const lang = this.translate.currentLang || 'en';
    return name[lang] || name.en || Object.values(name).find(Boolean) || '';
  }

  private asSearchText(value: unknown): string {
    if (value == null) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'object') {
      return Object.values(value as Record<string, unknown>)
        .filter((part) => typeof part === 'string')
        .join(' ');
    }
    return String(value);
  }
}
