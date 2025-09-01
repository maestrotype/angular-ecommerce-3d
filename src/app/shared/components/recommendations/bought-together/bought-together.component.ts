import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, from, of } from 'rxjs';
import { takeUntil, catchError } from 'rxjs/operators';
import { RecommendationsService, RecommendationProduct } from '../../../../core/services/recommendations.service';
import { Product } from 'src/shared/models/product.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { CartService } from '../../../../core/services/cart.service';

@Component({
  selector: 'app-bought-together',
  templateUrl: './bought-together.component.html',
  styleUrls: ['./bought-together.component.scss']
})
export class BoughtTogetherComponent implements OnInit, OnDestroy {
  @Input() product!: Product;
  @Input() limit: number = 4;
  @Input() showTitle: boolean = true;
  @Input() title: string = 'Frequently Bought Together';

  boughtTogetherProducts: RecommendationProduct[] = [];
  loading: boolean = true;
  error: boolean = false;
  private destroy$ = new Subject<void>();

  // Math object for template usage
  Math = Math;

  constructor(
    private recommendationsService: RecommendationsService,
    private router: Router,
    private notificationService: NotificationService,
    private cartService: CartService
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
    console.log('Quick view for product:', product);
    // Implement quick view functionality
  }

  onFavoriteToggled(event: any): void {
    console.log('Favorite toggled:', event);
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
    console.log('Added to cart:', product.name);
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

    console.log(`Product ${product.name} rated with ${rating} stars`);
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
          console.error('Error loading bought together products:', error);
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
          }
        },
        error: (error) => {
          console.error('Unexpected error in bought together products:', error);
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
      console.log('Navigating to bought-together product:', product);
      console.log('Product ID:', product.id, 'Type:', typeof product.id);
      
      if (!product.id && product.id !== 0) {
        console.error('Product ID is undefined, null, or empty');
        this.notificationService.showError(
          'Invalid product ID. Cannot navigate to product.',
          3000
        );
        return;
      }
      
      // Ensure product ID is a number
      const productId = Number(product.id);
      if (isNaN(productId)) {
        console.error('Product ID is not a valid number:', product.id);
        this.notificationService.showError(
          'Invalid product ID format. Cannot navigate to product.',
          3000
        );
        return;
      }
      
      console.log('Navigating to product ID:', productId);
      
      from(this.router.navigate(['/product', productId])).subscribe({
        next: (success) => {
          console.log('BoughtTogether: Navigation observable resolved with success:', success);
          if (success) {
            console.log('BoughtTogether: Navigation successful to product:', productId);
            console.log('BoughtTogether: New URL:', this.router.url);
            // Scroll to top after successful navigation
            setTimeout(() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 100);
          } else {
            console.error('BoughtTogether: Navigation returned false for product:', productId);
            console.log('BoughtTogether: Current URL after failed navigation:', this.router.url);
            // Don't show error notification for false return, as it might be normal
            // when navigating to the same route with different params
          }
        },
        error: (error) => {
          console.error('BoughtTogether: Navigation observable error for product:', productId, error);
          this.notificationService.showError(
            'Navigation error. Please try again.',
            3000
          );
        }
      });
    } catch (error) {
      console.error('Error navigating to product:', error);
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