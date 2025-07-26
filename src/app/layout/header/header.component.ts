import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { ProductService } from '../../core/services/product.service';
import { HeaderService, MenuItem, HeaderSettings } from '../../core/services/header.service';
import { Product } from 'src/shared/models/product.model';
import { ModalService } from '../../core/services/modal.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @ViewChild('searchInput') searchInput!: ElementRef;
  
  isMobileMenuOpen = false;
  isSearchOpen = false;
  searchTerm = '';
  searchResults: Product[] = [];
  cartCount = 0;
  private cartSubscription: Subscription = new Subscription();

  // Header customization
  headerSettings: HeaderSettings | null = null;
  menuItems: MenuItem[] = [];
  showSearch = true;
  showCart = true;
  showProfile = true;
  logoUrl: string | null = null;

  constructor(
    private router: Router,
    private productService: ProductService,
    private cartService: CartService,
    private headerService: HeaderService,
    private modalService: ModalService
  ) { }

  ngOnInit(): void {
    this.cartSubscription = this.cartService.getTotalCount().subscribe(
      count => this.cartCount = count
    );

    // Load header customization
    this.loadHeaderCustomization();
  }

  ngOnDestroy(): void {
    this.cartSubscription.unsubscribe();
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
        this.searchInput?.nativeElement?.focus();
      }, 100);
    }
  }

  onSearch() {
    if (this.searchTerm.trim().length >= 2) {
      this.productService.searchProducts(this.searchTerm).subscribe({
        next: (products) => {
          this.searchResults = products;
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

  onSearchBlur() {
    setTimeout(() => {
      this.isSearchOpen = false;
    }, 200);
  }

  performSearch() {
    if (this.searchTerm.trim()) {
      this.router.navigate(['/shop'], { 
        queryParams: { search: this.searchTerm } 
      });
      this.isSearchOpen = false;
      this.closeMobileMenu();
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

  viewAllResults() {
    this.performSearch();
  }

  goToProduct(productId: number) {
    this.router.navigate(['/product', productId]);
    this.isSearchOpen = false;
    this.searchResults = [];
    this.searchTerm = '';
  }

  goHome() {
    this.router.navigate(['/home']);
    this.closeMobileMenu();
  }

  scrollToSection(sectionId: string): void {
    if (this.router.url !== '/home') {
      this.router.navigate(['/home']).then(() => {
        setTimeout(() => {
          this.scrollToElement(sectionId);
        }, 100);
      });
    } else {
      this.scrollToElement(sectionId);
    }
    this.closeMobileMenu();
  }

  private scrollToElement(elementId: string): void {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  navigateToUrl(url: string): void {
    if (url.startsWith('#')) {
      // Internal anchor link
      const sectionId = url.substring(1);
      this.scrollToSection(sectionId);
    } else if (url.startsWith('/')) {
      // Internal route
      this.router.navigate([url]);
      this.closeMobileMenu();
    } else {
      // External link
      window.open(url, '_blank');
    }
  }

  canAccessMenuItem(menuItem: MenuItem): boolean {
    // For now, we'll assume user is not admin
    // In a real app, you'd get this from auth service
    const userRole = 'user'; // This should come from auth service
    return this.headerService.canAccessMenuItem(menuItem, userRole);
  }
}