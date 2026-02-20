import { Component, ViewChild, ElementRef, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { FavoritesService } from '../../core/services/favorites.service';
import { ProductService } from '../../core/services/product.service';
import { HeaderService, MenuItem, HeaderSettings } from '../../core/services/header.service';
import { Product } from 'src/shared/models/product.model';
import { ModalService } from '../../core/services/modal.service';
import { ThemeService } from '../../core/themes/theme.service';
import { Theme } from '../../core/themes/theme.model';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  @ViewChild('searchInput') searchInput!: ElementRef;
  @ViewChild('mobileSearchInput') mobileSearchInput!: ElementRef;

  isMobileMenuOpen = false;
  isSearchOpen = false;
  searchTerm = '';
  searchResults: any[] = [];
  cartCount = 0;
  favoritesCount = 0;
  isMobile = false;
  private cartSubscription: Subscription = new Subscription();
  private favoritesSubscription: Subscription = new Subscription();
  private themeSubscription: Subscription = new Subscription();

  // Header customization
  headerSettings: HeaderSettings | null = null;
  menuItems: MenuItem[] = []; // Initialize empty, load from API
  showSearch = true;
  showCart = true;
  showProfile = true;
  logoUrl: string | null = null;

  // Fallback menu items in case API fails completely
  private readonly FALLBACK_MENU_ITEMS: MenuItem[] = [
    { title: 'Home', url: '/home', access: 'all', isActive: true },
    { title: 'Shop', url: '/shop', access: 'all', isActive: true },
    { title: 'About', url: '/about', access: 'all', isActive: true },
    { title: 'Contacts', url: '/contacts', access: 'all', isActive: true },
    { title: 'Admin Panel', url: '/admin', access: 'admin', isActive: true }
  ];

  // Theme switching
  themes: Theme[] = [];
  currentTheme = 'default';
  showThemeMenu = false;
  // Feature flag for new theme switcher UI (keeps old one by default)
  enableNewThemeSwitcher = true;
  showNewThemeMenu = false;

  constructor(
    private router: Router,
    private productService: ProductService,
    private cartService: CartService,
    private favoritesService: FavoritesService,
    private headerService: HeaderService,
    private modalService: ModalService,
    private themeService: ThemeService,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit(): void {
    this.loadHeaderCustomization();
    this.loadCartCount();
    this.loadFavoritesCount();
    this.loadThemes();
    this.checkScreenSize();

    if (isPlatformBrowser(this.platformId)) {
      // Check theme when window regains focus (returning from admin)
      window.addEventListener('focus', () => {
        const actualTheme = this.themeService.getCurrentTheme().id;
        if (this.currentTheme !== actualTheme) {
          this.currentTheme = actualTheme;
          // Force reapply theme to DOM
          this.themeService.setTheme(actualTheme);
        }
      });

      // Also check when tab becomes visible (returning from admin)
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
          const actualTheme = this.themeService.getCurrentTheme().id;
          if (this.currentTheme !== actualTheme) {
            this.currentTheme = actualTheme;
            // Force reapply theme to DOM
            this.themeService.setTheme(actualTheme);
          }
        }
      });

      document.addEventListener('click', this.onDocumentClick.bind(this));

      window.addEventListener('resize', this.checkScreenSize.bind(this));
    }

    this.searchTerm = '';
    this.searchResults = [];
  }

  ngOnDestroy(): void {
    this.cartSubscription.unsubscribe();
    this.favoritesSubscription.unsubscribe();
    this.themeSubscription.unsubscribe();

    if (isPlatformBrowser(this.platformId)) {
      document.removeEventListener('click', this.onDocumentClick.bind(this));
      window.removeEventListener('resize', this.checkScreenSize.bind(this));
    }
  }

  private checkScreenSize(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.isMobile = window.innerWidth <= 768;
    } else {
      this.isMobile = false; // Default to desktop on server
    }
  }

  private onDocumentClick(event: MouseEvent): void {
    const searchIcon = (event.target as Element).closest('.search-icon');
    const searchInput = (event.target as Element).closest('.desktop-search, .mobile-search');
    const searchResults = (event.target as Element).closest('.search-results');
    const themeSwitcher = (event.target as Element).closest('.theme-switcher');

    if (!searchIcon && !searchInput && !searchResults) {
      this.isSearchOpen = false;
      this.searchTerm = '';
      this.searchResults = [];
    }

    // Close theme menus when clicking outside
    if (!themeSwitcher) {
      this.showThemeMenu = false;
      this.showNewThemeMenu = false;
    }
  }

  private loadHeaderCustomization(): void {
    // Load header settings
    this.headerService.getHeaderSettings().subscribe({
      next: settings => {
        if (settings) {
          this.headerSettings = settings;
          this.logoUrl = settings.logoUrl || null;
          this.showSearch = settings.showSearch !== false;
          this.showCart = settings.showCart !== false;
          this.showProfile = settings.showProfile !== false;
        }
      },
      error: err => {
        console.error('Error loading header settings:', err);
      }
    });

    // Load menu items
    this.headerService.getMenuItems().subscribe({
      next: items => {
        if (items && items.length > 0) {
          this.menuItems = items;
        } else {
          console.warn('API returned empty menu, using fallback.');
          this.menuItems = this.FALLBACK_MENU_ITEMS;
        }
      },
      error: err => {
        console.error('Error loading menu items, using fallback:', err);
        this.menuItems = this.FALLBACK_MENU_ITEMS;
      }
    });
  }

  private loadCartCount(): void {
    this.cartSubscription = this.cartService.getTotalCount().subscribe(
      count => this.cartCount = count
    );
  }

  private loadFavoritesCount(): void {
    this.favoritesSubscription = this.favoritesService.favoritesCount$.subscribe(
      count => this.favoritesCount = count
    );
  }

  private loadThemes(): void {
    this.themes = this.themeService.getAllThemes();

    // Get current theme immediately
    this.currentTheme = this.themeService.getCurrentTheme().id;

    // Subscribe to theme changes
    this.themeSubscription = this.themeService.currentTheme$.subscribe(theme => {
      this.currentTheme = theme.id;
    });
  }

  toggleThemeMenu(): void {
    this.showThemeMenu = !this.showThemeMenu;
  }

  // New switcher (hidden behind flag)
  toggleNewThemeMenu(): void {
    if (!this.enableNewThemeSwitcher) { return; }
    this.showNewThemeMenu = !this.showNewThemeMenu;
  }

  changeTheme(themeId: string): void {
    this.themeService.setTheme(themeId);
    this.showThemeMenu = false;
    this.showNewThemeMenu = false;
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }

  toggleSearch() {
    this.isSearchOpen = !this.isSearchOpen;
    if (this.isSearchOpen) {
      setTimeout(() => {
        if (this.searchInput) {
          this.searchInput.nativeElement.focus();
        }
      }, 100);
    }
  }

  onSearch() {
    if (this.searchTerm.trim().length > 2) {
      this.productService.searchProducts(this.searchTerm).subscribe({
        next: (results) => {
          this.searchResults = results;
        },
        error: (error) => {

          this.searchResults = [];
        }
      });
    } else {
      this.searchResults = [];
    }
  }

  performSearch() {
    if (this.searchTerm.trim()) {
      this.router.navigate(['/shop'], { queryParams: { search: this.searchTerm } });
      this.isSearchOpen = false;
      this.searchTerm = '';
      this.searchResults = [];
    }
  }

  openAuthModal(): void {
    this.modalService.openModal({
      id: 'auth-modal',
      type: 'auth',
      data: null,
      options: {
        closeOnBackdrop: true,
        closeOnEscape: true,
        showCloseButton: true
      }
    });
  }

  openCartModal(): void {
    this.modalService.openModal({
      id: 'cart-modal',
      type: 'cart',
      data: null,
      options: {
        closeOnBackdrop: true,
        closeOnEscape: true,
        showCloseButton: true
      }
    });
  }

  openFavoritesPage(): void {
    this.router.navigate(['/favorites']);
  }

  viewAllResults() {
    this.router.navigate(['/shop'], { queryParams: { search: this.searchTerm } });
    this.isSearchOpen = false;
    this.searchTerm = '';
    this.searchResults = [];
  }

  goToProduct(productId: number) {
    this.router.navigate(['/product', productId]);
    this.isSearchOpen = false;
    this.searchTerm = '';
    this.searchResults = [];
  }

  goHome() {
    this.router.navigate(['/home']);
    this.isSearchOpen = false;
    this.searchTerm = '';
    this.searchResults = [];
  }

  scrollToSection(sectionId: string): void {
    if (this.router.url !== '/home') {
      this.router.navigate(['/home']).then(() => {
        setTimeout(() => {
          this.scrollToElement(sectionId);
        }, 300);
      });
    } else {
      setTimeout(() => {
        this.scrollToElement(sectionId);
      }, 100);
    }
    this.closeMobileMenu();
  }

  private scrollToElement(elementId: string): void {
    const element = document.getElementById(elementId);
    if (element) {
      const headerHeight = 80; // Fixed header height
      const elementPosition = element.offsetTop - headerHeight;

      if (isPlatformBrowser(this.platformId)) {
        window.scrollTo({
          top: elementPosition,
          behavior: 'smooth'
        });
      }
    } else {

    }
  }

  navigateToUrl(url: string): void {
    if (url.startsWith('http')) {
      if (isPlatformBrowser(this.platformId)) {
        window.open(url, '_blank');
      }
    } else {
      this.router.navigate([url]);
    }
    this.closeMobileMenu();
    this.isSearchOpen = false;
    this.searchTerm = '';
    this.searchResults = [];
  }

  canAccessMenuItem(menuItem: MenuItem): boolean {
    if (menuItem.url.includes('admin')) {
      const user = this.authService.getUser();
      return user && user.role === 'admin';
    }
    return true;
  }

  isLoggedIn(): boolean {
    return !!this.authService.getToken();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/home']);
    this.closeMobileMenu();
  }

  handleMenuClick(menuItem: MenuItem): void {
    if (menuItem.url.startsWith('#')) {
      // Internal anchor link - scroll to section
      const sectionId = menuItem.url.substring(1);
      this.scrollToSection(sectionId);
    } else if (menuItem.url.startsWith('/')) {
      // Internal route
      this.router.navigate([menuItem.url]);
      this.closeMobileMenu();
      this.isSearchOpen = false;
      this.searchTerm = '';
      this.searchResults = [];
    } else {
      // External link
      if (isPlatformBrowser(this.platformId)) {
        window.open(menuItem.url, '_blank');
      }
    }
  }
}