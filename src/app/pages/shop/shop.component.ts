import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { CartService } from '../../core/services/cart.service';
import { FavoritesService } from '../../core/services/favorites.service';
import { NotificationService } from '../../core/services/notification.service';
import { OptimizationService } from '../../core/services/optimization.service';
import { Product } from 'src/shared/models/product.model';
import { Category } from 'src/shared/models/category.model';
import { CartItem } from 'src/shared/models/cart-item.model';
import { Subject, takeUntil } from 'rxjs';

interface DropdownOption {
  value: string;
  label: string;
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
  sortBy: string = 'name';
  viewMode: string = 'grid';
  
  // Pagination properties
  currentPage: number = 1;
  pageSize: number = 8;
  totalPages: number = 1;
  paginatedProducts: Product[] = [];
  
  // Loading state
  loading = true;
  
  // Dropdown options
  categoryOptions: DropdownOption[] = [];
  sortOptions: DropdownOption[] = [
    { value: 'name', label: 'Sort by Name' },
    { value: 'price', label: 'Sort by Price' },
    { value: 'rating', label: 'Sort by Rating' }
  ];
  
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    private favoritesService: FavoritesService,
    private categoryService: CategoryService,
    private notificationService: NotificationService,
    private optimizationService: OptimizationService
  ) {}

  ngOnInit() {
    this.loadCategories();
    this.loadProducts();
    this.setupRouteParams();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load categories for filtering
   */
  private loadCategories() {
    this.categoryService.getAllCategories().subscribe(categories => {
      this.categories = categories;
      this.categoryOptions = [
        { value: 'all', label: 'All categories' },
        ...categories.map(cat => ({ value: cat.name, label: cat.name }))
      ];
    });
  }

  /**
   * Load products with optimization
   */
  private loadProducts() {
    this.loading = true;
    
    // Use memoization for caching products
    this.optimizationService.memoizeObservable(
      'products:all',
      this.productService.getProducts(),
      []
    ).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (products) => {
        this.products = products;
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.loading = false;
      }
    });
  }

  /**
   * Setup route parameters for search and category
   */
  private setupRouteParams() {
    this.route.queryParams.subscribe(params => {
      if (params['search']) {
        this.searchTerm = params['search'];
      }
      if (params['category']) {
        this.selectedCategory = params['category'];
      }
      this.applyFilters();
    });
  }

  /**
   * Memoized function for getting unique categories
   */
  private getUniqueCategories(products: Product[]): string[] {
    return this.optimizationService.useCallback(
      'getUniqueCategories',
      (products: Product[]) => {
        return [...new Set(products.map(p => p.category))];
      },
      []
    )(products);
  }

  /**
   * Memoized function for filtering products
   */
  private filterProducts(products: Product[], category: string, search: string, sortBy: string): Product[] {
    return this.optimizationService.useCallback(
      'filterProducts',
      (products: Product[], category: string, search: string, sortBy: string) => {
        let filtered = products;
        
        // Filter by search term
        if (search) {
          const searchLower = search.toLowerCase();
          filtered = filtered.filter(product =>
            product.name.toLowerCase().includes(searchLower) ||
            product.description.toLowerCase().includes(searchLower)
          );
        }
        
        // Filter by category
        if (category !== 'all') {
          filtered = filtered.filter(product => product.category === category);
        }
        
        // Sort products
        switch (sortBy) {
          case 'name':
            filtered.sort((a, b) => a.name.localeCompare(b.name));
            break;
          case 'price':
            filtered.sort((a, b) => a.price - b.price);
            break;
          case 'rating':
            filtered.sort((a, b) => b.rating - a.rating);
            break;
        }
        
        return filtered;
      },
      []
    )(products, category, search, sortBy);
  }

  /**
   * Apply filters and update pagination
   */
  private applyFilters() {
    this.filteredProducts = this.filterProducts(
      this.products, 
      this.selectedCategory, 
      this.searchTerm,
      this.sortBy
    );
    
    this.totalPages = Math.max(1, Math.ceil(this.filteredProducts.length / this.pageSize));
    this.currentPage = Math.min(this.currentPage, this.totalPages);
    this.paginateProducts();
  }

  /**
   * Update paginated products
   */
  private paginateProducts() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedProducts = this.filteredProducts.slice(start, end);
  }

  // Event handlers
  onSearchChange() {
    this.currentPage = 1;
    this.applyFilters();
  }

  onCategoryChange(value: string) {
    this.selectedCategory = value;
    this.currentPage = 1;
    this.applyFilters();
  }

  onSortChange(value: string) {
    this.sortBy = value;
    this.currentPage = 1;
    this.applyFilters();
  }

  changeViewMode(mode: string) {
    this.viewMode = mode;
  }

  // Pagination methods
  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    this.currentPage = page;
    this.paginateProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.paginateProducts();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.paginateProducts();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // Product actions
  goToProductDetail(productId: number) {
    this.router.navigate(['/product', productId]).then(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  addToCart(product: Product) {
    const cartItem: Omit<CartItem, 'quantity'> = {
      productId: product.id,
      name: product.name,
      price: Number(this.getDiscountedPrice(product)), // Convert to number
      imageUrl: product.imageUrl,
      discount: product.discount,
      features: product.features,
      specifications: product.specifications,
    };
  
    this.cartService.addToCart(cartItem);
    this.notificationService.showSuccess(`Added ${product.name} to cart!`);
  }

  getDiscountedPrice(product: Product): number {
    if (product && product.discount) {
      return Number(product.price) * (1 - Number(product.discount) / 100);
    }
    return Number(product?.price) || 0;
  }

  onFavoriteToggled(event: { product: Product; isFavorite: boolean }) {
    console.log(`${event.product.name} ${event.isFavorite ? 'added to' : 'removed from'} favorites`);
  }

  // Memoized statistics
  get productsStats() {
    return this.optimizationService.memoize(
      'productsStats',
      () => ({
        total: this.products.length,
        filtered: this.filteredProducts.length,
        categories: this.categories.length
      }),
      [this.products.length, this.filteredProducts.length, this.categories.length]
    );
  }
}