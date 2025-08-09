import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
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

  // Header customization
  headerSettings: HeaderSettings | null = null;
  menuItems: MenuItem[] = [];
  showSearch = true;
  showCart = true;
  showProfile = true;
  logoUrl: string | null = null;
  
  // Theme switching
  themes: Theme[] = [];
  currentTheme = 'default';
  showThemeMenu = false;

  constructor(
    private router: Router,
    private productService: ProductService,
    private cartService: CartService,
    private favoritesService: FavoritesService,
    private headerService: HeaderService,
    private modalService: ModalService,
    private themeService: ThemeService
  ) { }

  ngOnInit(): void {
    this.loadHeaderCustomization();
    this.loadCartCount();
    this.loadFavoritesCount();
    this.loadThemes();
    this.checkScreenSize();
    
    this.searchTerm = '';
    this.searchResults = [];
    
    document.addEventListener('click', this.onDocumentClick.bind(this));
    
    window.addEventListener('resize', this.checkScreenSize.bind(this));
  }

  ngOnDestroy(): void {
    this.cartSubscription.unsubscribe();
    this.favoritesSubscription.unsubscribe();
    document.removeEventListener('click', this.onDocumentClick.bind(this));
    window.removeEventListener('resize', this.checkScreenSize.bind(this));
  }

  private checkScreenSize(): void {
    this.isMobile = window.innerWidth <= 768;
  }

  private onDocumentClick(event: MouseEvent): void {
    const searchIcon = (event.target as Element).closest('.search-icon');
    const searchInput = (event.target as Element).closest('.desktop-search, .mobile-search');
    const searchResults = (event.target as Element).closest('.search-results');
    
    if (!searchIcon && !searchInput && !searchResults) {
      this.isSearchOpen = false;
      this.searchTerm = '';
      this.searchResults = [];
    }
  }

  private loadHeaderCustomization(): void {
    // Load header settings
    this.headerService.getHeaderSettings().subscribe(settings => {
      this.headerSettings = settings;
      if (settings) {
        this.logoUrl = settings.logoUrl || null;
        this.showSearch = settings.showSearch !== false;
        this.showCart = settings.showCart !== false;
        this.showProfile = settings.showProfile !== false;
      }
    });

    // Load menu items
    this.headerService.getMenuItems().subscribe(items => {
      this.menuItems = items;
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
    this.currentTheme = this.themeService.getCurrentTheme().id;
  }
  
  toggleThemeMenu(): void {
    this.showThemeMenu = !this.showThemeMenu;
  }
  
  changeTheme(themeId: string): void {
    this.currentTheme = themeId;
    this.themeService.setTheme(themeId);
    this.showThemeMenu = false;
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
          console.error('Search error:', error);
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
      
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    } else {
      console.warn(`Element with id '${elementId}' not found`);
    }
  }

  navigateToUrl(url: string): void {
    if (url.startsWith('http')) {
      window.open(url, '_blank');
    } else {
      this.router.navigate([url]);
    }
    this.closeMobileMenu();
    this.isSearchOpen = false;
    this.searchTerm = '';
    this.searchResults = [];
  }

  canAccessMenuItem(menuItem: MenuItem): boolean {
    // For now, we'll assume user is not admin
    // In a real app, you'd get this from auth service
    const userRole = 'user'; // This should come from auth service
    return this.headerService.canAccessMenuItem(menuItem, userRole);
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
      window.open(menuItem.url, '_blank');
    }
  }
}