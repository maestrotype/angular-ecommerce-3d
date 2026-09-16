import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, of } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';
import { RecommendationsService, RecommendationProduct } from '../../../../core/services/recommendations.service';
import { Product } from 'src/shared/models/product.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { CartService } from '../../../../core/services/cart.service';
import { AnalyticsService } from '../../../../core/services/analytics.service';
import { TranslateService } from '@ngx-translate/core';
import { getLocalizedString } from 'src/shared/utils/localization.util';
import {
  resolveProductFromSectionContext,
  resolveRecommendationProductId,
} from 'src/shared/utils/section-product-context.util';
import { toProductFromRecommendation } from 'src/shared/utils/recommendation-product.util';

@Component({
  selector: 'app-similar-products',
  templateUrl: './similar-products.component.html',
  styleUrls: ['./similar-products.component.scss'],
})
export class SimilarProductsComponent implements OnInit, OnDestroy {
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

  @Input() limit = 4;
  @Input() showTitle = true;
  @Input() title: string | Record<string, string> = '';

  similarProducts: Product[] = [];
  loading = false;
  error = false;

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

  trackByProductId(_index: number, product: Product): number {
    return product.id;
  }

  goToShop(): void {
    this.router.navigate(['/shop']);
  }

  onProductClick(product: Product): void {
    this.analyticsService.trackEvent('recommendation_click', {
      product_id: product.id,
      product_name: product.name,
      recommendation_type: 'similar_products',
      source_product_id: this.sourceProductId ?? this.product?.id,
    });
  }

  onFavoriteToggle(event: { product: Product; isFavorite: boolean }): void {
    const name = getLocalizedString(event.product.name, this.translate.currentLang);
    const messageKey = event.isFavorite
      ? 'SHOP.NOTIFICATIONS.ADDED_TO_FAVORITES'
      : 'SHOP.NOTIFICATIONS.REMOVED_FROM_FAVORITES';
    this.translate.get(messageKey, { name }).subscribe((msg) => {
      this.notificationService.showSuccess(msg);
    });
  }

  onAddToCart(product: Product): void {
    const unitPrice = product.discount
      ? Number(product.price) * (1 - product.discount / 100)
      : Number(product.price);

    if (!this.cartService.addToCart({
      productId: product.id,
      name: product.name,
      price: unitPrice,
      imageUrl: product.imageUrl,
      discount: product.discount,
    })) {
      this.notificationService.showInfo(this.translate.instant('DEMO_CATALOG.ADD_TO_CART_BLOCKED'));
      return;
    }

    const name = getLocalizedString(product.name, this.translate.currentLang);
    this.translate.get('SHOP.NOTIFICATIONS.ADDED_TO_CART', { name }).subscribe((msg) => {
      this.notificationService.showSuccess(msg);
    });

    this.analyticsService.trackEvent('recommendation_add_to_cart', {
      product_id: product.id,
      product_name: product.name,
      recommendation_type: 'similar_products',
      source_product_id: this.sourceProductId ?? this.product?.id,
    });
  }

  retryLoad(): void {
    this.lastLoadedKey = null;
    this.loadRecommendations();
  }

  private applySectionContext(
    context: unknown,
    settings?: { productId?: number | string; limit?: number; showTitle?: boolean },
  ): void {
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

    if (this.lastLoadedKey === loadKey && (this.loading || this.similarProducts.length > 0)) {
      return;
    }

    this.lastLoadedKey = loadKey;

    if (this.usePersonalizedFallback) {
      this.fetchRecommendations(
        this.recommendationsService.getPersonalizedRecommendations(undefined, this.limit),
        'personalized',
      );
      return;
    }

    if (!this.sourceProductId) {
      return;
    }

    this.fetchRecommendations(
      this.recommendationsService.getSimilarProducts(this.sourceProductId, this.limit),
      'similar_products',
    );
  }

  private fetchRecommendations(
    source$: ReturnType<RecommendationsService['getSimilarProducts']>,
    recommendationType: string,
  ): void {
    this.loading = true;
    this.error = false;
    this.cdr.markForCheck();

    source$
      .pipe(
        takeUntil(this.destroy$),
        catchError(() => {
          this.error = true;
          this.loading = false;
          this.cdr.markForCheck();
          this.notificationService.showError(
            this.translate.instant('PRODUCT.ERRORS.LOAD_SIMILAR_FAILED'),
            5000,
          );
          return of([] as RecommendationProduct[]);
        }),
      )
      .subscribe({
        next: (products) => {
          this.similarProducts = products.map(toProductFromRecommendation);
          this.loading = false;
          this.error = false;
          this.cdr.markForCheck();

          if (products.length > 0) {
            this.analyticsService.trackEvent('recommendation_view', {
              recommendation_type: recommendationType,
              product_id: this.sourceProductId ?? undefined,
              recommended_count: products.length,
              recommended_ids: products.map((p) => p.id),
            });
          }
        },
        error: () => {
          this.error = true;
          this.loading = false;
          this.cdr.markForCheck();
        },
      });
  }
}
