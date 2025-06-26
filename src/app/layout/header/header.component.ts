import { Component, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { Product } from '../../core/models/Product';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  @ViewChild('searchInput') searchInput!: ElementRef;
  
  isMobileMenuOpen = false;
  isSearchOpen = false;
  searchTerm = '';
  searchResults: Product[] = [];

  constructor(
    private router: Router,
    private productService: ProductService
  ) { }

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
    } else {
      this.searchTerm = '';
      this.searchResults = [];
    }
  }

  onSearch() {
    if (this.searchTerm.trim()) {
      this.searchResults = this.productService.searchProducts(this.searchTerm);
    } else {
      this.searchResults = [];
    }
  }

  onSearchBlur() {
    // Задержка для обработки клика по результатам поиска
    setTimeout(() => {
      if (!this.searchTerm) {
        this.isSearchOpen = false;
        this.searchResults = [];
      }
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

  goToProduct(productId: number) {
    this.router.navigate(['/product', productId]);
    this.isSearchOpen = false;
    this.searchResults = [];
    this.searchTerm = '';
  }

  viewAllResults() {
    this.performSearch();
  }

  scrollToSection(sectionId: string): void {
    if(sectionId == 'home') {
      this.router.navigate(['/home']).then(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
    this.closeMobileMenu();
  }
}