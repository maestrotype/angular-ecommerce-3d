import { ChangeDetectorRef, Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, from, of } from 'rxjs';
import { takeUntil, catchError } from 'rxjs/operators';
import { RecommendationsService, RecommendationProduct } from '../../../../core/services/recommendations.service';
import { Product } from 'src/shared/models/product.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { CartService } from '../../../../core/services/cart.service';
import { AnalyticsService } from '../../../../core/services/analytics.service';
import { FavoritesService } from '../../../../core/services/favorites.service';
import { TranslateService } from '@ngx-translate/core';
import { getLocalizedString } from 'src/shared/utils/localization.util';
import {
  resolveProductFromSectionContext,
  resolveRecommendationProductId,
} from 'src/shared/utils/section-product-context.util';

@Component({
  selector: 'app-bought-together',
  templateUrl: './bought-together.component.html',
  styleUrls: ['./bought-together.component.scss']
})
export class BoughtTogetherComponent implements OnInit, OnDestroy {
  @Input() product!: Product;

  @Input() set data(val: any) {
    if (val?.settings) {
      this.limit = val.settings.limit || this.limit;
      this.showTitle = val.settings.showTitle ?? this.showTitle;
    }
    if (val?.title) {
      this.title = val.title;
    }

    this.contextApplied = true;
    this.applySectionContext(val?.context, val?.settings);
    this.loadRecommendations();
  }
  @Input() limit: number = 4;
  @Input() showTitle: boolean = true;
  @Input() title: string | Record<string, string> = '';

  boughtTogetherProducts: RecommendationProduct[] = [];
  loading: boolean = false;
  error: boolean = false;
  private contextApplied = false;
  private usePersonalizedFallback = false;
  private sourceProductId: number | null = null;
  private lastLoadedKey: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private recommendationsService: RecommendationsService,
    private router: Router,
    private notificationService: NotificationService,
    private cartService: CartService,
    private analyticsService: AnalyticsService,
    private favoritesService: FavoritesService,
    private translate: TranslateService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    if (this.contextApplied) {
      return;
    }

    if (this.product?.id) {
      this.sourceProductId = this.product.id;
      this.loadRecommendations();
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

  hasRating(product: RecommendationProduct): boolean {
    return Number(product.rating) > 0;
  }

  goToShop(): void {
    this.router.navigate(['/shop']);
  }

  isFavorite(productId: number): boolean {
    return this.favoritesService.isFavorite(productId);
  }

  toggleFavorite(product: RecommendationProduct, event?: Event): void {
    event?.stopPropagation();
    this.favoritesService.toggleFavorite(product as Product);
    const name = getLocalizedString(product.name, this.translate.currentLang);
    const messageKey = this.isFavorite(product.id)
      ? 'SHOP.NOTIFICATIONS.ADDED_TO_FAVORITES'
      : 'SHOP.NOTIFICATIONS.REMOVED_FROM_FAVORITES';

    this.translate.get(messageKey, { name }).subscribe(msg => {
      this.notificationService.showSuccess(msg);
    });
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
    const productName = getLocalizedString(product.name, this.translate.currentLang);
    this.notificationService.showSuccess(`Added ${productName} to cart!`);

    this.analyticsService.trackEvent('recommendation_add_to_cart', {
      product_id: product.id,
      product_name: product.name,
      recommendation_type: 'bought_together',
      source_product_id: this.sourceProductId ?? this.product?.id
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

  private applySectionContext(context: unknown, settings?: { productId?: number | string; limit?: number; showTitle?: boolean }): void {
    const resolvedProduct = resolveProductFromSectionContext(context);
    if (resolvedProduct) {
      this.product = resolvedProduct;
    }

    this.sourceProductId = resolveRecommendationProductId(context, settings);
    this.usePersonalizedFallback = !this.sourceProductId;

    if (this.sourceProductId && !resolvedProduct) {
      this.product = { id: this.sourceProductId } as Product;
    }
  }

  private loadRecommendations(): void {
    const loadKey = this.usePersonalizedFallback ? 'personalized' : `product:${this.sourceProductId}`;

    if (!this.usePersonalizedFallback && !this.sourceProductId) {
      this.loading = false;
      this.error = false;
      this.cdr.markForCheck();
      return;
    }

    if (this.lastLoadedKey === loadKey && (this.loading || this.boughtTogetherProducts.length > 0)) {
      return;
    }

    this.lastLoadedKey = loadKey;

    if (this.usePersonalizedFallback) {
      this.loadPersonalizedRecommendations();
      return;
    }

    this.loadBoughtTogetherProducts();
  }

  private loadPersonalizedRecommendations(): void {
    this.loading = true;
    this.error = false;
    this.cdr.markForCheck();

    this.recommendationsService.getPersonalizedRecommendations(undefined, this.limit)
      .pipe(
        takeUntil(this.destroy$),
        catchError(() => {
          this.error = true;
          this.loading = false;
          this.cdr.markForCheck();
          this.notificationService.showError(
            'Failed to load recommendations. Please try again.',
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
          this.cdr.markForCheck();

          if (products.length > 0) {
            this.analyticsService.trackEvent('recommendation_view', {
              recommendation_type: 'personalized',
              product_id: undefined,
              recommended_count: products.length,
              recommended_ids: products.map(p => p.id)
            });
          }
        },
        error: () => {
          this.error = true;
          this.loading = false;
          this.cdr.markForCheck();
        }
      });
  }

  private loadBoughtTogetherProducts(): void {
    if (!this.sourceProductId) {
      return;
    }

    this.loading = true;
    this.error = false;
    this.cdr.markForCheck();

    this.recommendationsService.getBoughtTogetherProducts(this.sourceProductId, this.limit)
      .pipe(
        takeUntil(this.destroy$),
        catchError(() => {
          this.error = true;
          this.loading = false;
          this.cdr.markForCheck();
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
          this.cdr.markForCheck();

          if (products.length === 0) {
            this.notificationService.showInfo(
              'No frequently bought together products found for this item.',
              3000
            );
          } else {
            this.analyticsService.trackEvent('recommendation_view', {
              recommendation_type: 'bought_together',
              product_id: this.sourceProductId ?? undefined,
              recommended_count: products.length,
              recommended_ids: products.map(p => p.id)
            });
          }
        },
        error: () => {
          this.error = true;
          this.loading = false;
          this.cdr.markForCheck();
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
        source_product_id: this.sourceProductId ?? this.product?.id
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
    this.lastLoadedKey = null;
    this.loadRecommendations();
  }
} 