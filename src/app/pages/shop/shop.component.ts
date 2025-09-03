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
  viewMode: 'list' | 'grid-2' | 'grid-3' | 'grid-4' | 'grid-5' = 'grid-4';
  
  // Filter sidebar properties
  isFilterSidebarOpen = false;
  minPrice: number | null = null;
  maxPrice: number | null = null;
  showOnlyOnSale = false;
  
  // Filter categories for sidebar
  filterCategories: FilterCategory[] = [
    { id: 'shoes', name: 'Shoes', count: 24, selected: false },
    { id: 'bags', name: 'Bags', count: 18, selected: false },
    { id: 'clothing', name: 'Clothing', count: 32, selected: false },
    { id: 'accessories', name: 'Accessories', count: 15, selected: false }
  ];

  // Dropdown options
  categoryOptions: DropdownOption[] = [
    { value: 'all', label: 'All categories' },
    { value: 'shoes', label: 'Shoes' },
    { value: 'bags', label: 'Bags' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'accessories', label: 'Accessories' }
  ];

  sortOptions: DropdownOption[] = [
    { value: 'latest', label: 'Latest' },
    { value: 'name', label: 'Name' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Rating' }
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
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
    this.setupRouteParams();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadProducts(): void {
    this.productService.getProducts()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (products) => {
          this.products = products;
          this.applyFilters();
        },
        error: (error) => {
          console.error('Error loading products:', error);
          this.notificationService.showError('Failed to load products');
        }
      });
  }

  private loadCategories(): void {
    this.categoryService.getAllCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (categories) => {
          this.categories = categories;
        },
        error: (error) => {
          console.error('Error loading categories:', error);
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
    // Apply category filters from sidebar
    const selectedCategories = this.filterCategories.filter(cat => cat.selected).map(cat => cat.id);
    
    // Apply price filter
    // Apply sale filter
    
    // Close sidebar
    this.isFilterSidebarOpen = false;
    
    // Trigger product filtering
    this.filterProducts();
  }

  changeViewMode(mode: 'list' | 'grid-2' | 'grid-3' | 'grid-4' | 'grid-5'): void {
    this.viewMode = mode;
  }

  private filterProducts(): void {
    let filtered = [...this.products];

    // Filter by category
    if (this.selectedCategory !== 'all') {
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
    console.log('Quick view:', product);
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
    this.notificationService.showSuccess(`${product.name} added to cart`);
  }

  trackByProductId(index: number, product: Product): number {
    return product.id;
  }
}