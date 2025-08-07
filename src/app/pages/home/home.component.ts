// Importing required dependencies and interfaces
import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../core/services/product.service';
import { Product } from 'src/shared/models/product.model';
import { SectionService } from 'src/admin/services/section.service';
import { Section } from 'src/shared/models/section.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  sections: Section[] = [];
  bestSellers: Product[] = [];
  specialOffer: Product | undefined;
  
  // Loading states for different content sections
  sectionsLoading = true;
  bestSellersLoading = true;
  specialOfferLoading = true;
  
  // Enhanced skeleton data for better user experience during loading
  skeletonSections = [
    { type: 'hero', height: '600px', delay: 0 },
    { type: 'content', height: '400px', delay: 200 },
    { type: 'content', height: '500px', delay: 400 }
  ];
  skeletonProducts = Array(4).fill(null);

  constructor(
    private productService: ProductService, 
    private sectionService: SectionService
  ) {}

  ngOnInit() {
    // Load critical content first (above-the-fold sections)
    this.loadSections();
    
    // Load secondary content in parallel
    this.loadBestSellers();
    this.loadSpecialOffers();
  }

  /**
   * Load page sections with loading state management
   * Optimized for faster loading without artificial delays
   */
  private loadSections(): void {
    this.sectionsLoading = true;
    this.sectionService.getActiveSections().subscribe({
      next: (sections) => {
        this.sections = sections.sort((a, b) => a.order - b.order);
        this.sectionsLoading = false;
      },
      error: (err) => {
        console.error('Error loading sections:', err);
        this.sectionsLoading = false;
      }
    });
  }

  /**
   * Load best sellers products
   */
  private loadBestSellers(): void {
    this.bestSellersLoading = true;
    this.productService.getBestSellers().subscribe({
      next: (products) => {
        this.bestSellers = products;
        this.bestSellersLoading = false;
      },
      error: (err) => {
        console.error('Error loading best sellers:', err);
        this.bestSellersLoading = false;
      }
    });
  }

  /**
   * Load special offer products
   */
  private loadSpecialOffers(): void {
    this.specialOfferLoading = true;
    this.productService.getSpecialOffers().subscribe({
      next: (products) => {
        this.specialOffer = products[0];
        this.specialOfferLoading = false;
      },
      error: (err) => {
        console.error('Error loading special offers:', err);
        this.specialOfferLoading = false;
      }
    });
  }

  /**
   * Smooth scroll to specific section
   */
  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  }
}