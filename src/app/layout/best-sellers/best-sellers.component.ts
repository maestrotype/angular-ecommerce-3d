import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, OnDestroy, Inject, PLATFORM_ID, ElementRef, NgZone, ViewChild } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { Product } from 'src/shared/models/product.model';
import { ProductService } from '../../core/services/product.service';
import { Section } from 'src/shared/models/section.model';
import { PageSectionContext } from 'src/shared/models/page-section-context.model';
import { CartService } from '../../core/services/cart.service';
import { NotificationService } from '../../core/services/notification.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { getLocalizedString } from '../../../shared/utils/localization.util';
import { LocalizedPipe } from '../../shared/pipes/localized.pipe';
import { ImageUrlPipe } from '../../shared/pipes/image-url.pipe';
import { FavoritesService } from '../../core/services/favorites.service';

type BestSellersSectionData = Section & { context?: PageSectionContext };

@Component({
    selector: 'app-best-sellers',
    templateUrl: './best-sellers.component.html',
    styleUrls: ['./best-sellers.component.scss'],
    standalone: true,
    imports: [CommonModule, RouterModule, SharedModule, TranslateModule, LocalizedPipe, ImageUrlPipe],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BestSellersComponent implements OnInit, OnDestroy {
    bestSellers: Product[] = [];
    visibleCount = 0;
    eagerImageCount = 3;
    private contextApplied = false;
    private loadObserver?: IntersectionObserver;
    private sentinelEl?: HTMLElement;
    private revealing = false;

    @Input() set data(val: BestSellersSectionData) {
        if (val?.context?.bestSellers !== undefined) {
            this.bestSellers = val.context.bestSellers;
            this.contextApplied = true;
            this.resetVisibleCount();
            this.cdr.markForCheck();
        }
    }

    get bestSellersProducts(): Product[] {
        return this.bestSellers.slice(0, this.visibleCount);
    }

    get hasMore(): boolean {
        return this.visibleCount < this.bestSellers.length;
    }

    Math = Math;

    constructor(
        private router: Router,
        private productService: ProductService,
        private cartService: CartService,
        private notificationService: NotificationService,
        private translate: TranslateService,
        private favoritesService: FavoritesService,
        private ngZone: NgZone,
        private cdr: ChangeDetectorRef,
        @Inject(PLATFORM_ID) private platformId: Object
    ) { }

    ngOnInit(): void {
        if (this.contextApplied) {
            return;
        }

        this.productService.getBestSellers().subscribe({
            next: (products) => {
                this.bestSellers = products;
                this.resetVisibleCount();
                this.cdr.markForCheck();
            },
            error: () => {}
        });
    }

    ngOnDestroy(): void {
        this.loadObserver?.disconnect();
    }

    @ViewChild('loadMoreSentinel')
    set loadMoreSentinel(ref: ElementRef<HTMLElement> | undefined) {
        this.sentinelEl = ref?.nativeElement;
        this.observeLoadMore(this.sentinelEl);
    }

    private resetVisibleCount(): void {
        if (!isPlatformBrowser(this.platformId)) {
            this.visibleCount = this.bestSellers.length;
            return;
        }

        const isMobile = window.matchMedia('(max-width: 768px)').matches;
        const columns = this.readGridColumns();
        this.eagerImageCount = columns;
        this.visibleCount = isMobile
            ? this.bestSellers.length
            : Math.min(columns, this.bestSellers.length);
    }

    private readGridColumns(): number {
        const raw = getComputedStyle(document.documentElement)
            .getPropertyValue('--product-grid-columns')
            .trim();
        const columns = Number.parseInt(raw, 10);
        return Number.isFinite(columns) && columns > 0 ? columns : 3;
    }

    private readRevealMargin(sentinel: HTMLElement): string {
        return getComputedStyle(sentinel).scrollMarginTop || '0px';
    }

    private readRevealMarginPx(sentinel: HTMLElement): number {
        const px = Number.parseFloat(this.readRevealMargin(sentinel));
        return Number.isFinite(px) ? px : 0;
    }

    private observeLoadMore(sentinel?: HTMLElement): void {
        if (!isPlatformBrowser(this.platformId) || !this.hasMore) {
            this.loadObserver?.disconnect();
            return;
        }

        if (!(sentinel instanceof HTMLElement)) {
            this.loadObserver?.disconnect();
            return;
        }

        this.loadObserver?.disconnect();
        const revealMargin = this.readRevealMargin(sentinel);
        this.ngZone.runOutsideAngular(() => {
            this.loadObserver = new IntersectionObserver(
                (entries) => {
                    if (!entries.some((entry) => entry.isIntersecting)) {
                        return;
                    }
                    this.ngZone.run(() => this.revealNextBatch());
                },
                { rootMargin: `${revealMargin} 0px` }
            );
            this.loadObserver.observe(sentinel);
        });
    }

    private revealNextBatch(): void {
        if (this.revealing || !this.hasMore) {
            if (!this.hasMore) {
                this.loadObserver?.disconnect();
            }
            return;
        }

        this.revealing = true;
        this.visibleCount = Math.min(
            this.visibleCount + this.readGridColumns(),
            this.bestSellers.length
        );
        this.cdr.markForCheck();

        requestAnimationFrame(() => {
            this.revealing = false;
            if (!this.hasMore) {
                this.loadObserver?.disconnect();
                return;
            }
            this.fillViewportIfNeeded();
        });
    }

    private fillViewportIfNeeded(): void {
        const sentinel = this.sentinelEl;
        if (!sentinel || !this.hasMore) {
            return;
        }

        const rect = sentinel.getBoundingClientRect();
        if (rect.top < window.innerHeight + this.readRevealMarginPx(sentinel)) {
            this.revealNextBatch();
        }
    }

    trackByProductId(index: number, product: Product): number {
        return product.id;
    }

    quickView(product: Product): void {
        // Implement quick view functionality
    }

    goToProductDetail(productId: number): void {
        this.router.navigate(['/product', productId]).then(() => {
            if (isPlatformBrowser(this.platformId)) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }

    addToCart(product: Product, event?: Event): void {
        event?.stopPropagation();
        const cartItem = {
            productId: product.id,
            name: product.name,
            price: Number(product.price),
            imageUrl: product.imageUrl,
            discount: product.discount
        };
        if (!this.cartService.addToCart(cartItem)) {
            this.notificationService.showInfo(this.translate.instant('DEMO_CATALOG.ADD_TO_CART_BLOCKED'));
            return;
        }
        const productName = getLocalizedString(product.name, this.translate.currentLang);
        this.notificationService.showSuccess(`Added ${productName} to cart!`);
    }

    onFavoriteToggled(event: any): void {
        // Implement favorite functionality
    }

    isFavorite(productId: number): boolean {
        return this.favoritesService.isFavorite(productId);
    }

    toggleFavorite(product: Product): void {
        this.favoritesService.toggleFavorite(product);
        const name = getLocalizedString(product.name, this.translate.currentLang);
        const isFavorite = this.isFavorite(product.id);

        const messageKey = isFavorite
            ? 'SHOP.NOTIFICATIONS.ADDED_TO_FAVORITES'
            : 'SHOP.NOTIFICATIONS.REMOVED_FROM_FAVORITES';

        this.translate.get(messageKey, { name }).subscribe(msg => {
            this.notificationService.showSuccess(msg);
        });
    }

    rateProduct(product: Product, rating: number): void {
        event?.stopPropagation();

        if (!product.userRating) {
            product.userRating = rating;
            product.ratingCount = (product.ratingCount || 0) + 1;
        } else {
            product.userRating = rating;
        }

        this.updateProductRating(product);

        const productName = getLocalizedString(product.name, this.translate.currentLang);
        this.notificationService.showSuccess(`Rated ${productName} with ${rating} stars!`);
    }

    private updateProductRating(product: Product): void {
        if (product.userRating) {
            const currentRating = product.rating || 0;
            const currentCount = product.ratingCount || 0;

            if (currentCount > 0) {
                product.rating = ((currentRating * currentCount) + product.userRating) / (currentCount + 1);
            } else {
                product.rating = product.userRating;
            }
        }
    }
}
