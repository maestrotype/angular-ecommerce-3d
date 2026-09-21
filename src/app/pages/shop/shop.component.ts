import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { take, timeout, catchError } from 'rxjs/operators';
import { of, Subject, takeUntil } from 'rxjs';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { CartService } from '../../core/services/cart.service';
import { FavoritesService } from '../../core/services/favorites.service';
import { NotificationService } from '../../core/services/notification.service';
import { OptimizationService } from '../../core/services/optimization.service';
import { ThemeService } from '../../core/themes/theme.service';
import { ThemeId } from '../../core/themes/theme.model';
import { TranslateService } from '@ngx-translate/core';
import { SectionService } from '../../core/services/section.service';
import { ShopCatalogSettingsService } from '../../core/services/shop-catalog-settings.service';
import { mapAdminSortToShopSort, ShopCatalogDisplaySettings, categoryQueryMatches, selectedCategoryFromFilterState, normalizeCategoryRef } from '../../../shared/utils/shop-catalog.util';
import { getLocalizedString } from '../../../shared/utils/localization.util';
import { Product } from 'src/shared/models/product.model';
import { Category } from 'src/shared/models/category.model';
import { CartItem } from 'src/shared/models/cart-item.model';
import { Section } from 'src/shared/models/section.model';

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

type CatalogPageItem =
  | { kind: 'page'; page: number }
  | { kind: 'ellipsis'; id: string };

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
  pageItems: CatalogPageItem[] = [];

  // View mode — default columns follow active theme (light 5 / dark 4 / glass 3)
  viewMode: 'list' | 'grid-2' | 'grid-3' | 'grid-4' | 'grid-5' = 'grid-5';

  private readonly themeGridDefaults: Record<ThemeId, 'grid-2' | 'grid-3' | 'grid-4' | 'grid-5'> = {
    light: 'grid-5',
    dark: 'grid-4',
    glass: 'grid-3',
    'dark-glass': 'grid-4',
  };

  // Filter sidebar properties
  isFilterSidebarOpen = false;
  minPrice: number | null = null;
  maxPrice: number | null = null;
  showOnlyOnSale = false;
  shopSections: Section[] = [];
  sectionsLoading = true;

  // Filter categories for sidebar - will be populated from API
  filterCategories: FilterCategory[] = [];
  private shopCatalogSettings: ShopCatalogDisplaySettings | null = null;
  private catalogSettingsApplied = false;
  private routeCategoryActive = false;

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
  private wasMobileCatalog: boolean | null = null;

  // Math object for template usage
  Math = Math;

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private cartService: CartService,
    private favoritesService: FavoritesService,
    private notificationService: NotificationService,
    private optimizationService: OptimizationService,
    private themeService: ThemeService,
    private sectionService: SectionService,
    private translate: TranslateService,
    private router: Router,
    private route: ActivatedRoute,
    private shopCatalogSettingsService: ShopCatalogSettingsService,
  ) { }

  ngOnInit(): void {
    this.initOptions();
    this.applyThemeGridDefault(this.themeService.getCurrentTheme().id);
    this.loadShopSections();
    this.loadShopCatalogSettings();
    this.loadProducts();
    this.loadCategories();
    this.setupRouteParams();

    this.themeService.currentTheme$.pipe(takeUntil(this.destroy$)).subscribe((theme) => {
      this.applyThemeGridDefault(theme.id);
    });

    // Refresh options on lang change
    this.translate.onLangChange.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.initOptions();
      this.loadCategories(); // To refresh "All categories" label
    });
  }

  private loadShopSections(): void {
    this.sectionsLoading = true;
    this.sectionService.getActiveSections('shop').pipe(
      takeUntil(this.destroy$),
      catchError((err) => {
        console.error('Error loading shop sections', err);
        return of([]);
      })
    ).subscribe({
      next: (sections) => {
        this.shopSections = (sections || [])
          .filter((section) => section.type !== 'header' && section.type !== 'footer')
          .sort((a, b) => (a.order || 0) - (b.order || 0));
        this.sectionsLoading = false;
      },
      error: () => {
        this.sectionsLoading = false;
      },
      complete: () => {
        this.sectionsLoading = false;
      }
    });
  }

  private applyThemeGridDefault(themeId: ThemeId): void {
    if (this.viewMode === 'list') {
      return;
    }
    this.viewMode = this.themeGridDefaults[themeId] ?? 'grid-3';
  }

  private initOptions(): void {
    this.sortOptions = [
      { value: 'latest', label: this.translate.instant('SHOP.SORT.LATEST') },
      { value: 'name', label: this.translate.instant('SHOP.SORT.NAME') },
      { value: 'price-low', label: this.translate.instant('SHOP.SORT.PRICE_LOW') },
      { value: 'price-high', label: this.translate.instant('SHOP.SORT.PRICE_HIGH') },
      { value: 'stock', label: this.translate.instant('SHOP.SORT.STOCK') },
      { value: 'rating', label: this.translate.instant('SHOP.SORT.RATING') }
    ];
  }

  private loadShopCatalogSettings(): void {
    this.shopCatalogSettingsService.getSettings()
      .pipe(takeUntil(this.destroy$))
      .subscribe((settings) => {
        this.shopCatalogSettings = settings;
        this.tryApplyShopCatalogSettings();
      });
  }

  private tryApplyShopCatalogSettings(): void {
    const settings = this.shopCatalogSettings;
    if (!settings?.enabled || this.catalogSettingsApplied || this.categories.length === 0) {
      return;
    }

    const routeCategory = this.route.snapshot.queryParams['category'];
    const routeSearch = this.route.snapshot.queryParams['search'];
    if (!routeCategory && !routeSearch) {
      if (settings.categories.length > 0) {
        this.filterCategories.forEach((category) => {
          category.selected = settings.categories.some((slug) =>
            categoryQueryMatches(category.id, slug)
          );
        });
        this.syncSelectedCategoryFromSidebar(false);
      }

      this.sortBy = mapAdminSortToShopSort(settings.sortOrder);
    }

    this.catalogSettingsApplied = true;
    this.applyFilters();
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
              ...categories.map(cat => {
                const name = getLocalizedString(cat.name, this.translate.currentLang);
                return { value: name, label: name };
              })
            ];
          });

          // Update filter categories with real data and counts
          this.updateFilterCategories();
          this.tryApplyShopCatalogSettings();
        },
        error: (error) => {

        }
      });
  }

  private updateFilterCategories(): void {
    this.filterCategories = this.categories.map((category) => {
      const name = getLocalizedString(category.name, this.translate.currentLang);
      const slug = this.getCategorySlug(category, name);
      return {
        id: slug,
        name,
        count: this.countProductsInCategory(slug, name),
        selected: categoryQueryMatches(this.selectedCategory, slug, name),
      };
    });
  }

  private getCategorySlug(category: Category, displayName?: string): string {
    const name = displayName ?? getLocalizedString(category.name, this.translate.currentLang);
    return category.slug || normalizeCategoryRef(name);
  }

  private productMatchesCategory(product: Product, categorySlug: string, categoryName: string): boolean {
    return categoryQueryMatches(product.category || '', categorySlug, categoryName);
  }

  private countProductsInCategory(categorySlug: string, categoryName: string): number {
    return this.products.filter((product) =>
      this.productMatchesCategory(product, categorySlug, categoryName)
    ).length;
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
        error: () => {
          this.translate.get('SHOP.NOTIFICATIONS.ERROR_LOADING').subscribe((message) => {
            this.notificationService.showError(message);
          });
        }
      });
  }

  private setupRouteParams(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const routeCategory = typeof params['category'] === 'string' ? params['category'] : '';
        if (routeCategory) {
          this.selectedCategory = routeCategory;
          this.routeCategoryActive = true;
        } else if (this.routeCategoryActive) {
          this.selectedCategory = 'all';
          this.filterCategories.forEach((category) => {
            category.selected = false;
          });
          this.routeCategoryActive = false;
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

  get hasActiveFilters(): boolean {
    return (
      this.showOnlyOnSale ||
      this.minPrice !== null ||
      this.maxPrice !== null ||
      this.filterCategories.some((category) => category.selected)
    );
  }

  toggleFilterSidebar(): void {
    this.isFilterSidebarOpen = !this.isFilterSidebarOpen;
  }

  applyFilters(): void {
    this.runFilters(true, 'selection');
  }

  applySidebarFilters(): void {
    this.runFilters(true, 'sidebar');
  }

  onLiveFilterChange(): void {
    this.runFilters(false, 'sidebar');
  }

  clearAllFilters(): void {
    this.filterCategories.forEach((category) => {
      category.selected = false;
    });
    this.minPrice = null;
    this.maxPrice = null;
    this.showOnlyOnSale = false;
    this.selectedCategory = 'all';
    this.runFilters(false, 'sidebar');
  }

  private runFilters(closeSidebar: boolean, source: 'selection' | 'sidebar'): void {
    this.currentPage = 1;
    this.updateCategoryCounts();
    if (source === 'selection') {
      this.applySelectedCategoryToSidebar();
    }
    this.syncSelectedCategoryFromSidebar(source === 'sidebar');

    if (closeSidebar) {
      this.isFilterSidebarOpen = false;
    }

    this.filterProducts();
    this.updateUrl();
  }

  private applySelectedCategoryToSidebar(): void {
    if (this.selectedCategory === 'all' || this.filterCategories.length === 0) {
      return;
    }
    this.filterCategories.forEach((category) => {
      category.selected = categoryQueryMatches(this.selectedCategory, category.id, category.name);
    });
  }

  private syncSelectedCategoryFromSidebar(allowClearToAll: boolean): void {
    const selectedIds = this.filterCategories.filter((cat) => cat.selected).map((cat) => cat.id);
    this.selectedCategory = selectedCategoryFromFilterState(
      selectedIds,
      this.selectedCategory,
      allowClearToAll,
    );
  }

  changeViewMode(mode: 'list' | 'grid-2' | 'grid-3' | 'grid-4' | 'grid-5'): void {
    this.viewMode = mode;
  }

  private filterProducts(): void {
    let filtered = [...this.products];

    // Filter by selected categories from sidebar
    const selectedCategories = this.filterCategories.filter((cat) => cat.selected);
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((product) =>
        selectedCategories.some((category) =>
          this.productMatchesCategory(product, category.id, category.name)
        )
      );
    } else if (this.selectedCategory !== 'all') {
      const routeCategory = this.filterCategories.find((category) =>
        categoryQueryMatches(this.selectedCategory, category.id, category.name)
      );
      if (routeCategory) {
        filtered = filtered.filter((product) =>
          this.productMatchesCategory(product, routeCategory.id, routeCategory.name)
        );
      } else {
        filtered = filtered.filter((product) =>
          categoryQueryMatches(product.category || '', this.selectedCategory)
        );
      }
    }

    // Filter by search term
    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(product => {
        const name = getLocalizedString(product.name, this.translate.currentLang).toLowerCase();
        const description = getLocalizedString(product.description, this.translate.currentLang).toLowerCase();
        return name.includes(searchLower) || description.includes(searchLower);
      });
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
        return products.sort((a, b) =>
          getLocalizedString(a.name, this.translate.currentLang).localeCompare(getLocalizedString(b.name, this.translate.currentLang))
        );
      case 'price-low':
        return products.sort((a, b) => a.price - b.price);
      case 'price-high':
        return products.sort((a, b) => b.price - a.price);
      case 'stock':
        return products.sort((a, b) => (a.stock || 0) - (b.stock || 0));
      case 'rating':
        return products.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      default:
        return products;
    }
  }

  private updatePagination(): void {
    const isMobileCatalog = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;
    this.wasMobileCatalog = isMobileCatalog;

    // Mobile: full 2-col grid — no pagination chrome
    if (isMobileCatalog) {
      this.totalPages = 1;
      this.currentPage = 1;
      this.paginatedProducts = this.filteredProducts;
      this.pageItems = [];
      return;
    }

    this.totalPages = Math.ceil(this.filteredProducts.length / this.itemsPerPage) || 1;
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedProducts = this.filteredProducts.slice(startIndex, endIndex);
    this.pageItems = this.buildPageItems(this.currentPage, this.totalPages);
  }

  private buildPageItems(current: number, total: number): CatalogPageItem[] {
    if (total <= 7) {
      return Array.from({ length: total }, (_, index) => ({ kind: 'page', page: index + 1 }));
    }

    const pages = new Set<number>([1, total, current, current - 1, current + 1]);
    const sorted = [...pages]
      .filter((page) => page >= 1 && page <= total)
      .sort((a, b) => a - b);

    const items: CatalogPageItem[] = [];
    let previous = 0;
    for (const page of sorted) {
      if (previous && page - previous > 1) {
        items.push({ kind: 'ellipsis', id: `e-${previous}-${page}` });
      }
      items.push({ kind: 'page', page });
      previous = page;
    }
    return items;
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    const isMobileCatalog = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;
    if (this.wasMobileCatalog === isMobileCatalog) {
      return;
    }
    this.updatePagination();
  }

  private updateUrl(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        category: this.selectedCategory !== 'all' ? this.selectedCategory : null,
        search: this.searchTerm || null,
      },
      queryParamsHandling: 'merge'
    });
  }

  goToProductDetail(productId: number): void {
    this.router.navigate(['/product', productId]);
  }

  quickView(product: Product): void {
    // Implement quick view functionality

  }

  onFavoriteToggled(event: Event, product: Product): void {
    event.stopPropagation();
    event.preventDefault();
    
    this.favoritesService.toggleFavorite(product);
    product.isFavorite = !product.isFavorite; // Locally toggle for immediate UI feedback
    
    const messageKey = product.isFavorite ? 'SHOP.NOTIFICATIONS.ADDED_TO_FAVORITES' : 'SHOP.NOTIFICATIONS.REMOVED_FROM_FAVORITES';
    const productName = getLocalizedString(product.name, this.translate.currentLang);
    this.notificationService.showSuccess(this.translate.instant(messageKey, { name: productName }));
  }

  addToCart(product: Product, event: Event): void {
    event.stopPropagation();

    const cartItem: CartItem = {
      productId: product.id,
      name: getLocalizedString(product.name, this.translate.currentLang),
      price: product.price,
      quantity: 1,
      imageUrl: product.imageUrl
    };

    if (!this.cartService.addToCart(cartItem)) {
      this.notificationService.showInfo(this.translate.instant('DEMO_CATALOG.ADD_TO_CART_BLOCKED'));
      return;
    }
    this.notificationService.showSuccess(this.translate.instant('SHOP.NOTIFICATIONS.ADDED_TO_CART', { name: getLocalizedString(product.name, this.translate.currentLang) }));
  }

  trackByProductId(index: number, product: Product): number {
    return product.id;
  }

  trackByPageItem(_index: number, item: CatalogPageItem): string | number {
    return item.kind === 'ellipsis' ? item.id : item.page;
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  rateProduct(product: Product, rating: number, event?: Event): void {
    event?.stopPropagation();

    if (!product.userRating) {
      product.userRating = rating;
      product.ratingCount = (product.ratingCount || 0) + 1;
    } else {
      product.userRating = rating;
    }

    this.updateProductRating(product);

    const productName = getLocalizedString(product.name, this.translate.currentLang);
    this.notificationService.showSuccess(`Rated ${productName} with ${rating} stars!`);
  }

  private updateProductRating(product: Product): void {
    if (!product.ratingCount) {
      product.rating = product.userRating || 0;
      return;
    }
    product.rating = product.userRating || product.rating || 0;
  }

  private updateCategoryCounts(): void {
    this.filterCategories.forEach((filterCategory) => {
      filterCategory.count = this.countProductsInCategory(filterCategory.id, filterCategory.name);
    });
  }
}
