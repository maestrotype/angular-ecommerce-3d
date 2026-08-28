import { Component, ViewChild, ElementRef, OnInit, OnDestroy, Inject, PLATFORM_ID, Input, OnChanges, SimpleChanges } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Subscription } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CartService } from '../../core/services/cart.service';
import { FavoritesService } from '../../core/services/favorites.service';
import { ProductService } from '../../core/services/product.service';
import { HeaderService, MenuItem, HeaderSettings } from '../../core/services/header.service';
import { Product } from 'src/shared/models/product.model';
import { ModalService } from '../../core/services/modal.service';
import { ThemeService } from '../../core/themes/theme.service';
import { Theme } from '../../core/themes/theme.model';
import { AuthService } from '../../core/services/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { MobileMenuService } from '../../core/services/mobile-menu.service';
import { findSectionElement } from 'src/shared/utils/section-anchor.util';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy, OnChanges {
  @Input() data: any; // Support for Architect Live Preview
  @ViewChild('searchInput') searchInput!: ElementRef;
  @ViewChild('mobileSearchInput') mobileSearchInput!: ElementRef;

  isMobileMenuOpen = false;
  isSearchOpen = false;
  searchTerm = '';
  searchResults: any[] = [];
  cartCount = 0;
  favoritesCount = 0;
  isMobile = false;
  isMobileSearchExpanded = false;
  private cartSubscription: Subscription = new Subscription();
  private favoritesSubscription: Subscription = new Subscription();
  private themeSubscription: Subscription = new Subscription();
  private mobileMenuSubscription: Subscription = new Subscription();

  // Header customization
  headerSettings: HeaderSettings | null = null;
  menuItems: MenuItem[] = []; // Initialize empty, load from API
  showSearch = true;
  showCart = true;
  showProfile = true;
  logoUrl: string | null = null;

  // Language customization
  languages = [
    { code: 'en', label: 'EN' },
    { code: 'ru', label: 'RU' },
    { code: 'ua', label: 'UA' }
  ];
  currentLang = 'en';
  showLangMenu = false;

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
  currentTheme = 'light';
  showThemeMenu = false;
  // Feature flag for new theme switcher UI (keeps old one by default)
  enableNewThemeSwitcher = false;
  showNewThemeMenu = false;

  /** Active home-page section (#about, #contacts) — overrides route-based Home highlight */
  activeSectionId: string | null = null;
  private scrollSpyObserver?: IntersectionObserver;
  private routerSubscription?: Subscription;

  constructor(
    private router: Router,
    private productService: ProductService,
    private cartService: CartService,
    private favoritesService: FavoritesService,
    private headerService: HeaderService,
    private modalService: ModalService,
    private themeService: ThemeService,
    private authService: AuthService,
    public translate: TranslateService,
    private mobileMenuService: MobileMenuService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Initialize default language
    this.currentLang = this.translate.currentLang || this.translate.getDefaultLang() || 'en';
  }

  ngOnInit(): void {
    this.loadHeaderCustomization();
    this.loadCartCount();
    this.loadFavoritesCount();
    this.loadThemes();
    this.checkScreenSize();

    if (isPlatformBrowser(this.platformId)) {
      // Check theme when window regains focus (returning from admin)
      window.addEventListener('focus', () => this.syncThemeFromService());

      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
          this.syncThemeFromService();
        }
      });

      document.addEventListener('click', this.onDocumentClick.bind(this));

      window.addEventListener('resize', this.checkScreenSize.bind(this));
    }

    this.searchTerm = '';
    this.searchResults = [];

    this.routerSubscription = this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => this.onRouteChange());

    this.mobileMenuSubscription = this.mobileMenuService.isOpen$.subscribe((open) => {
      this.isMobileMenuOpen = open;
      if (!open) {
        this.prefPanel = null;
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) {
      // Force mobile state if coming from Architect Preview
      if (this.data.previewMode) {
        this.isMobile = this.data.previewMode === 'mobile' || this.data.previewMode === 'tablet';
        
        // Also ensure Hamburger is closed initially
        if (changes['data'].firstChange) {
          this.mobileMenuService.close();
        }
      }

      if (this.data.settings) {
        const settings = this.data.settings;
        this.logoUrl = settings.logoUrl || null;
        this.showSearch = settings.showSearch !== false;
        this.showCart = settings.showCart !== false;
        this.showProfile = settings.showProfile !== false;
      }
    }
  }

  ngOnDestroy(): void {
    this.cartSubscription.unsubscribe();
    this.favoritesSubscription.unsubscribe();
    this.themeSubscription.unsubscribe();
    this.mobileMenuSubscription.unsubscribe();
    this.routerSubscription?.unsubscribe();
    this.teardownScrollSpy();

    if (isPlatformBrowser(this.platformId)) {
      document.removeEventListener('click', this.onDocumentClick.bind(this));
      window.removeEventListener('resize', this.checkScreenSize.bind(this));
    }
  }

  private checkScreenSize(): void {
    // If we're in architect preview mode, respect the mode passed in rather than window size
    if (this.data?.previewMode) {
      this.isMobile = this.data.previewMode === 'mobile' || this.data.previewMode === 'tablet';
      return;
    }

    if (isPlatformBrowser(this.platformId)) {
      this.isMobile = window.innerWidth <= 768;
      if (!this.isMobile) {
        this.isMobileSearchExpanded = false;
      }
    } else {
      this.isMobile = false; // Default to desktop on server
    }
  }

  expandMobileSearch(): void {
    this.isMobileSearchExpanded = true;
    setTimeout(() => this.mobileSearchInput?.nativeElement?.focus(), 50);
  }

  collapseMobileSearch(): void {
    this.isMobileSearchExpanded = false;
    this.searchTerm = '';
    this.searchResults = [];
  }

  private onDocumentClick(event: MouseEvent): void {
    const searchIcon = (event.target as Element).closest('.search-icon');
    const searchInput = (event.target as Element).closest('.desktop-search, .mobile-search');
    const searchResults = (event.target as Element).closest('.search-results');
    const themeSwitcher = (event.target as Element).closest('.theme-switcher');
    const langSwitcher = (event.target as Element).closest('.lang-switcher');

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

    // Close language menu when clicking outside
    if (!langSwitcher) {
      this.showLangMenu = false;
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
        this.onRouteChange();
      },
      error: err => {
        console.error('Error loading menu items, using fallback:', err);
        this.menuItems = this.FALLBACK_MENU_ITEMS;
        this.onRouteChange();
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
    this.themes = this.themeService.getThemesByArea('frontend');
    this.syncThemeFromService();

    this.themeSubscription = this.themeService.currentTheme$.subscribe(theme => {
      this.currentTheme = theme.id;
    });
  }

  private syncThemeFromService(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (this.router.url.startsWith('/admin')) return;

    this.themeService.syncThemeToCurrentArea();
    this.currentTheme = this.themeService.getCurrentTheme().id;
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

  toggleLangMenu(): void {
    this.showLangMenu = !this.showLangMenu;
  }

  changeLanguage(langCode: string): void {
    this.currentLang = langCode;
    this.translate.use(langCode);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('preferredLanguage', langCode);
    }
    this.showLangMenu = false;
  }

  toggleMobileMenu() {
    this.mobileMenuService.toggle();
  }

  closeMobileMenu() {
    this.mobileMenuService.close();
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
      return this.hasAdminAccess;
    }
    return true;
  }

  get hasAdminAccess(): boolean {
    const user = this.authService.getUser();
    return !!(user && user.role === 'admin');
  }

  isLoggedIn(): boolean {
    return !!this.authService.getToken();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/home']);
    this.closeMobileMenu();
  }

  handleMenuClick(menuItem: MenuItem, event?: MouseEvent): void {
    this.isSearchOpen = false;
    this.closeMobileMenu();

    if (menuItem.url.startsWith('#')) {
      const sectionId = menuItem.url.substring(1);
      this.activeSectionId = sectionId;
      this.scrollToSection(sectionId);
    } else if (menuItem.url.startsWith('/')) {
      this.onRouteMenuClick(menuItem);
    } else {
      if (isPlatformBrowser(this.platformId)) {
        window.open(menuItem.url, '_blank');
      }
    }
  }

  onRouteMenuClick(menuItem: MenuItem): void {
    this.activeSectionId = null;
    this.searchTerm = '';
    this.searchResults = [];

    if (menuItem.url === '/home' && isPlatformBrowser(this.platformId)) {
      const path = this.router.url.split('?')[0];
      if (path === '/home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }

  isMenuItemActive(item: MenuItem): boolean {
    const url = item.url || '';

    if (url.startsWith('#')) {
      return this.activeSectionId === url.substring(1);
    }

    if (!url.startsWith('/')) {
      return false;
    }

    const currentPath = this.router.url.split('?')[0];

    if (url === '/home') {
      return currentPath === '/home' && !this.activeSectionId;
    }

    if (url === '/admin') {
      return currentPath.startsWith('/admin');
    }

    return currentPath === url || currentPath.startsWith(`${url}/`);
  }

  menuGlyph(item: MenuItem): 'home' | 'shop' | 'about' | 'contacts' | 'admin' | 'page' {
    const url = (item.url || '').toLowerCase();
    if (url.includes('admin')) {
      return 'admin';
    }
    if (url.includes('shop')) {
      return 'shop';
    }
    if (url.includes('contact')) {
      return 'contacts';
    }
    if (url.includes('about') || url.includes('brand')) {
      return 'about';
    }
    if (url.includes('home') || url === '/' || url === '') {
      return 'home';
    }
    return 'page';
  }

  isAdminMenuItem(item: MenuItem): boolean {
    return (item.url || '').toLowerCase().includes('admin');
  }

  themeI18nKey(themeId: string): string {
    return themeId.replace(/-/g, '_').toUpperCase();
  }

  prefPanel: 'theme' | 'lang' | null = null;

  togglePrefPanel(panel: 'theme' | 'lang'): void {
    this.prefPanel = this.prefPanel === panel ? null : panel;
  }

  pickTheme(themeId: string): void {
    this.changeTheme(themeId);
    this.prefPanel = null;
  }

  pickLanguage(langCode: string): void {
    this.changeLanguage(langCode);
    this.prefPanel = null;
  }

  private onRouteChange(): void {
    const path = this.router.url.split('?')[0];

    if (path !== '/home') {
      this.activeSectionId = null;
      this.teardownScrollSpy();
      return;
    }

    this.syncActiveSectionFromHash();
    this.setupScrollSpy();

    if (isPlatformBrowser(this.platformId)) {
      const hash = window.location.hash.replace(/^#/, '');
      if (hash) {
        setTimeout(() => this.scrollToElement(hash), 350);
      }
    }
  }

  private syncActiveSectionFromHash(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const hash = window.location.hash.replace(/^#/, '');
    this.activeSectionId = hash || null;
  }

  private setupScrollSpy(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.teardownScrollSpy();

    const sectionIds = this.menuItems
      .filter(item => (item.url || '').startsWith('#'))
      .map(item => item.url.substring(1));

    if (!sectionIds.length) {
      return;
    }

    this.scrollSpyObserver = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(entry => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible.length > 0) {
          this.activeSectionId = visible[0].target.id;
          return;
        }

        if (window.scrollY < 120) {
          this.activeSectionId = null;
        }
      },
      { rootMargin: '-15% 0px -55% 0px', threshold: [0, 0.2, 0.45] }
    );

    const observeSections = () => {
      sectionIds.forEach(id => {
        const element = findSectionElement(id);
        if (element) {
          this.scrollSpyObserver?.observe(element);
        }
      });
    };

    observeSections();
    setTimeout(observeSections, 400);
  }

  private teardownScrollSpy(): void {
    this.scrollSpyObserver?.disconnect();
    this.scrollSpyObserver = undefined;
  }

  scrollToSection(sectionId: string): void {
    if (this.router.url.split('?')[0] !== '/home') {
      this.router.navigate(['/home']).then(() => {
        this.setupScrollSpy();
        this.scrollToElement(sectionId);
      });
    } else {
      this.scrollToElement(sectionId);
    }
  }

  private scrollToElement(elementId: string): void {
    if (!isPlatformBrowser(this.platformId)) return;

    let retries = 0;
    const maxRetries = 20;

    const tryScroll = () => {
      const element = findSectionElement(elementId);

      if (element) {
        // Use scrollIntoView which is more robust
        // No manual window.scrollBy here to avoid flickering
        // We rely on scroll-margin-top in CSS for the offset
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      } else if (retries < maxRetries) {
        retries++;
        setTimeout(tryScroll, 150);
      } else {
        console.warn(`[Header] Could not find element with ID: ${elementId} after ${maxRetries} retries`);
      }
    };

    tryScroll();
  }
}