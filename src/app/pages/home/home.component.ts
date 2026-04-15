import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { take, timeout, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { ProductService } from '../../core/services/product.service';
import { Product } from 'src/shared/models/product.model';
import { SectionService } from 'src/admin/services/section.service';
import { Section } from 'src/shared/models/section.model';
import { isPlatformBrowser } from '@angular/common';

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
    private sectionService: SectionService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

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
    this.sectionService.getActiveSections('home').pipe(
      take(1),
      timeout(15000),
      catchError(err => {
        console.error('Error loading sections', err);
        return of([]);
      })
    ).subscribe({
      next: (sections) => {
        this.sections = (sections || []).sort((a, b) => (a.order || 0) - (b.order || 0));
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

  /**
   * Load best sellers products
   */
  private loadBestSellers(): void {
    this.bestSellersLoading = true;
    this.productService.getBestSellers().pipe(
      take(1),
      timeout(10000),
      catchError(err => {
        console.error('Error loading best sellers', err);
        return of([]);
      })
    ).subscribe({
      next: (products) => {
        this.bestSellers = products;
        this.bestSellersLoading = false;
      },
      error: () => {
        this.bestSellersLoading = false;
      },
      complete: () => {
        this.bestSellersLoading = false;
      }
    });
  }

  /**
   * Load special offer products
   */
  private loadSpecialOffers(): void {
    this.specialOfferLoading = true;
    this.productService.getSpecialOffers().pipe(
      take(1),
      timeout(10000),
      catchError(err => {
        console.error('Error loading special offers', err);
        return of([]);
      })
    ).subscribe({
      next: (products) => {
        this.specialOffer = products[0];
        this.specialOfferLoading = false;
      },
      error: () => {
        this.specialOfferLoading = false;
      },
      complete: () => {
        this.specialOfferLoading = false;
      }
    });
  }

  /**
   * Smooth scroll to specific section
   */
  scrollToSection(sectionId: string): void {
    if (isPlatformBrowser(this.platformId)) {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }
  }
}