import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, from, of } from 'rxjs';
import { takeUntil, catchError } from 'rxjs/operators';
import { RecommendationsService, RecommendationProduct } from '../../../../core/services/recommendations.service';
import { Product } from 'src/shared/models/product.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { CartService } from '../../../../core/services/cart.service';
import { AnalyticsService } from '../../../../core/services/analytics.service';

@Component({
  selector: 'app-bought-together',
  templateUrl: './bought-together.component.html',
  styleUrls: ['./bought-together.component.scss']
})
export class BoughtTogetherComponent implements OnInit, OnDestroy {
  @Input() product!: Product;

  @Input() set data(val: any) {
    if (val?.context) {
      this.product = val.context;
      if (!this.boughtTogetherProducts || this.boughtTogetherProducts.length === 0) {
         this.loadBoughtTogetherProducts();
      }
    }
    if (val?.settings) {
       this.limit = val.settings.limit || this.limit;
       this.showTitle = val.settings.showTitle ?? this.showTitle;
    }
    if (val?.title) {
       this.title = typeof val.title === 'string' ? val.title : val.title.en;
    }
  }
  @Input() limit: number = 4;
  @Input() showTitle: boolean = true;
  @Input() title: string = 'Frequently Bought Together';

  boughtTogetherProducts: RecommendationProduct[] = [];
  loading: boolean = false;
  error: boolean = false;
  private destroy$ = new Subject<void>();

  // Math object for template usage
  Math = Math;

  constructor(
    private recommendationsService: RecommendationsService,
    private router: Router,
    private notificationService: NotificationService,
    private cartService: CartService,
    private analyticsService: AnalyticsService
  ) {}

  ngOnInit(): void {
    if (this.product) {
      this.loadBoughtTogetherProducts();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // TrackBy function for performance
  trackByProductId(index: number, product: RecommendationProduct): number {
    return product.id;
  }

  quickView(product: RecommendationProduct): void {
    
    // Implement quick view functionality
  }

  onFavoriteToggled(event: any): void {
    
    // Implement favorite functionality
  }

  addToCart(product: RecommendationProduct, event: Event): void {
    event.stopPropagation();
    const cartItem = {
      productId: product.id,
      name: product.name,
      price: Number(product.price),
      imageUrl: product.imageUrl,
      discount: product.discount
    };
    this.cartService.addToCart(cartItem);
    this.notificationService.showSuccess(`Added ${product.name} to cart!`);
    
    // Track add to cart event
    this.analyticsService.trackEvent('recommendation_add_to_cart', {
      product_id: product.id,
      product_name: product.name,
      recommendation_type: 'bought_together',
      source_product_id: this.product.id
    });
  }

  // Rating functionality
  rateProduct(product: RecommendationProduct, rating: number): void {
    event?.stopPropagation();

    // Update product rating locally
    if (!product.userRating) {
      product.userRating = rating;
      product.ratingCount = (product.ratingCount || 0) + 1;
    } else {
      // If user already rated, update their rating
      const oldRating = product.userRating;
      product.userRating = rating;
    }

    // Recalculate average rating
    this.updateProductRating(product);

    // Show success message
    this.notificationService.showSuccess(`Rated ${product.name} with ${rating} stars!`);

    
  }

  private updateProductRating(product: RecommendationProduct): void {
    // This would typically call a service to update the rating on the backend
    // For now, we'll just update the local rating
    if (product.userRating) {
      // Simple average calculation (in real app, this would come from backend)
      const currentRating = product.rating || 0;
      const currentCount = product.ratingCount || 0;

      if (currentCount > 0) {
        product.rating = ((currentRating * currentCount) + product.userRating) / (currentCount + 1);
      } else {
        product.rating = product.userRating;
      }
    }
  }

  private loadBoughtTogetherProducts(): void {
    this.loading = true;
    this.error = false;
    
    this.recommendationsService.getBoughtTogetherProducts(this.product.id, this.limit)
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          
          this.error = true;
          this.loading = false;
          this.notificationService.showError(
            'Failed to load frequently bought together products. Please try again.',
            5000
          );
          return of([]);
        })
      )
      .subscribe({
        next: (products) => {
          this.boughtTogetherProducts = products;
          this.loading = false;
          this.error = false;
          
          if (products.length === 0) {
            this.notificationService.showInfo(
              'No frequently bought together products found for this item.',
              3000
            );
          } else {
            // Track recommendation view
            this.analyticsService.trackEvent('recommendation_view', {
              recommendation_type: 'bought_together',
              product_id: this.product.id,
              recommended_count: products.length,
              recommended_ids: products.map(p => p.id)
            });
          }
        },
        error: (error) => {
          
          this.error = true;
          this.loading = false;
          this.notificationService.showError(
            'An unexpected error occurred while loading frequently bought together products.',
            5000
          );
        }
      });
  }

  onProductClick(product: RecommendationProduct): void {
    try {
      
      
      
      if (!product.id && product.id !== 0) {
        
        this.notificationService.showError(
          'Invalid product ID. Cannot navigate to product.',
          3000
        );
        return;
      }
      
      // Ensure product ID is a number
      const productId = Number(product.id);
      if (isNaN(productId)) {
        
        this.notificationService.showError(
          'Invalid product ID format. Cannot navigate to product.',
          3000
        );
        return;
      }
      
      
      
      // Track recommendation click
      this.analyticsService.trackEvent('recommendation_click', {
        product_id: productId,
        product_name: product.name,
        recommendation_type: 'bought_together',
        source_product_id: this.product.id
      });
      
      from(this.router.navigate(['/product', productId])).subscribe({
        next: (success) => {
          
          if (success) {
            
            
            // Scroll to top after successful navigation
            setTimeout(() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 100);
          } else {
            
            
            // Don't show error notification for false return, as it might be normal
            // when navigating to the same route with different params
          }
        },
        error: (error) => {
          
          this.notificationService.showError(
            'Navigation error. Please try again.',
            3000
          );
        }
      });
    } catch (error) {
      
      this.notificationService.showError(
        'Unable to navigate to product page. Please try again.',
        3000
      );
    }
  }

  getDiscountedPrice(product: RecommendationProduct): number {
    if (product.discount) {
      return product.price * (1 - product.discount / 100);
    }
    return product.price;
  }

  retryLoad(): void {
    this.loadBoughtTogetherProducts();
  }
} 