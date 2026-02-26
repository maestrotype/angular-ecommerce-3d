import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { CartService } from '../../core/services/cart.service';
import { FavoritesService } from '../../core/services/favorites.service';
import { NotificationService } from '../../core/services/notification.service';
import { OptimizationService } from '../../core/services/optimization.service';
import { TranslateService } from '@ngx-translate/core';
import { Product } from 'src/shared/models/product.model';
import { Category } from 'src/shared/models/category.model';
import { CartItem } from 'src/shared/models/cart-item.model';
import { Subject, takeUntil } from 'rxjs';

interface DropdownOption {
  value: string;
  label: string;
}

interface FilterCategory {
  id: string;
  name: string;
  count: number;
  selected: boolean;
}

@Component({
  selector: 'app-shop',
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.scss']
})
export class ShopComponent implements OnInit, OnDestroy {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: Category[] = [];

  // Filter and sort properties
  searchTerm: string = '';
  selectedCategory: string = 'all';
  sortBy: string = 'latest';
  currentPage: number = 1;
  itemsPerPage: number = 18;
  totalPages: number = 1;
  paginatedProducts: Product[] = [];

  // View mode
  viewMode: 'list' | 'grid-2' | 'grid-3' | 'grid-4' = 'grid-4';

  // Filter sidebar properties
  isFilterSidebarOpen = false;
  minPrice: number | null = null;
  maxPrice: number | null = null;
  showOnlyOnSale = false;

  // Filter categories for sidebar - will be populated from API
  filterCategories: FilterCategory[] = [];

  // Dropdown options
  categoryOptions: DropdownOption[] = [];
  sortOptions: DropdownOption[] = [];
  itemsPerPageOptions: DropdownOption[] = [
    { value: '12', label: '12' },
    { value: '18', label: '18' },
    { value: '24', label: '24' },
    { value: '36', label: '36' }
  ];

  private destroy$ = new Subject<void>();

  // Math object for template usage
  Math = Math;

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private cartService: CartService,
    private favoritesService: FavoritesService,
    private notificationService: NotificationService,
    private optimizationService: OptimizationService,
    private translate: TranslateService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.initOptions();
    this.loadProducts();
    this.loadCategories();
    this.setupRouteParams();

    // Refresh options on lang change
    this.translate.onLangChange.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.initOptions();
      this.loadCategories(); // To refresh "All categories" label
    });
  }

  private initOptions(): void {
    this.sortOptions = [
      { value: 'latest', label: this.translate.instant('SHOP.SORT.LATEST') },
      { value: 'name', label: this.translate.instant('SHOP.SORT.NAME') },
      { value: 'price-low', label: this.translate.instant('SHOP.SORT.PRICE_LOW') },
      { value: 'price-high', label: this.translate.instant('SHOP.SORT.PRICE_HIGH') },
      { value: 'rating', label: this.translate.instant('SHOP.SORT.RATING') }
    ];
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCategories(): void {
    this.categoryService.getAllCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (categories) => {
          this.categories = categories;

          // Update dropdown options
          this.translate.get('SHOP.FILTERS.ALL_CATEGORIES').pipe(takeUntil(this.destroy$)).subscribe(label => {
            this.categoryOptions = [
              { value: 'all', label: label },
              ...categories.map(cat => ({ value: cat.name, label: cat.name }))
            ];
          });

          // Update filter categories with real data and counts
          this.updateFilterCategories();
        },
        error: (error) => {

        }
      });
  }

  private updateFilterCategories(): void {
    // Create filter categories from real categories and count products
    this.filterCategories = this.categories.map(category => {
      const count = this.products.filter(product => product.category === category.name).length;
      return {
        id: category.name,
        name: category.name,
        count: count,
        selected: false
      };
    });
  }

  private loadProducts(): void {
    this.productService.getProducts()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (products) => {
          this.products = products;
          // Update filter categories after products are loaded
          this.updateFilterCategories();
          this.applyFilters();
        },
        error: (error) => {

          this.notificationService.showError(this.translate.instant('SHOP.NOTIFICATIONS.ERROR_LOADING'));
        }
      });
  }

  private setupRouteParams(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        if (params['category']) {
          this.selectedCategory = params['category'];
        }
        if (params['search']) {
          this.searchTerm = params['search'];
        }
        this.applyFilters();
      });
  }

  onCategoryChange(category: string): void {
    this.selectedCategory = category;
    this.currentPage = 1;
    this.applyFilters();
    this.updateUrl();
  }

  onSortChange(sortBy: string): void {
    this.sortBy = sortBy;
    this.applyFilters();
  }

  onItemsPerPageChange(value: string): void {
    this.itemsPerPage = parseInt(value);
    this.currentPage = 1;
    this.updatePagination();
  }

  toggleFilterSidebar(): void {
    this.isFilterSidebarOpen = !this.isFilterSidebarOpen;
  }

  applyFilters(): void {
    // Update category counts
    this.updateCategoryCounts();

    // Sync selectedCategory with sidebar selections
    const selectedCategories = this.filterCategories.filter(cat => cat.selected).map(cat => cat.id);
    if (selectedCategories.length === 1) {
      this.selectedCategory = selectedCategories[0];
    } else if (selectedCategories.length === 0) {
      this.selectedCategory = 'all';
    }
    // If multiple categories selected, keep current selectedCategory but filter by all selected

    // Close sidebar
    this.isFilterSidebarOpen = false;

    // Trigger product filtering
    this.filterProducts();
  }

  changeViewMode(mode: 'list' | 'grid-2' | 'grid-3' | 'grid-4'): void {
    this.viewMode = mode;
  }

  private filterProducts(): void {
    let filtered = [...this.products];

    // Filter by selected categories from sidebar
    const selectedCategories = this.filterCategories.filter(cat => cat.selected).map(cat => cat.id);
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(product => selectedCategories.includes(product.category || ''));
    } else if (this.selectedCategory !== 'all') {
      // Fallback to dropdown category filter
      filtered = filtered.filter(product => product.category === this.selectedCategory);
    }

    // Filter by search term
    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchLower) ||
        product.description?.toLowerCase().includes(searchLower)
      );
    }

    // Filter by price range
    if (this.minPrice !== null) {
      filtered = filtered.filter(product => product.price >= this.minPrice!);
    }
    if (this.maxPrice !== null) {
      filtered = filtered.filter(product => product.price <= this.maxPrice!);
    }

    // Filter by sale status
    if (this.showOnlyOnSale) {
      filtered = filtered.filter(product => product.isSpecial || product.discount);
    }

    // Sort products
    filtered = this.sortProducts(filtered, this.sortBy);

    this.filteredProducts = filtered;
    this.updatePagination();
  }

  private sortProducts(products: Product[], sortBy: string): Product[] {
    switch (sortBy) {
      case 'latest':
        // Since Product doesn't have createdAt, sort by id (assuming higher id = newer)
        return products.sort((a, b) => b.id - a.id);
      case 'name':
        return products.sort((a, b) => a.name.localeCompare(b.name));
      case 'price-low':
        return products.sort((a, b) => a.price - b.price);
      case 'price-high':
        return products.sort((a, b) => b.price - a.price);
      case 'rating':
        return products.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      default:
        return products;
    }
  }

  private updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredProducts.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedProducts = this.filteredProducts.slice(startIndex, endIndex);
  }

  private updateUrl(): void {
    const queryParams: any = {};
    if (this.selectedCategory !== 'all') {
      queryParams.category = this.selectedCategory;
    }
    if (this.searchTerm) {
      queryParams.search = this.searchTerm;
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge'
    });
  }

  goToProductDetail(productId: number): void {
    this.router.navigate(['/product', productId]);
  }

  quickView(product: Product): void {
    // Implement quick view functionality

  }

  onFavoriteToggled(event: Event): void {
    event.stopPropagation();
    // Implement favorite toggle functionality
  }

  addToCart(product: Product, event: Event): void {
    event.stopPropagation();

    const cartItem: CartItem = {
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      imageUrl: product.imageUrl
    };

    this.cartService.addToCart(cartItem);
    this.notificationService.showSuccess(this.translate.instant('SHOP.NOTIFICATIONS.ADDED_TO_CART', { name: product.name }));
  }

  trackByProductId(index: number, product: Product): number {
    return product.id;
  }

  // Add method to update counts when filters change
  private updateCategoryCounts(): void {
    this.filterCategories.forEach(filterCategory => {
      const count = this.products.filter(product => product.category === filterCategory.id).length;
      filterCategory.count = count;
    });
  }
}