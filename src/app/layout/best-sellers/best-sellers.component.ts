import { Component, Input, OnInit, Inject, PLATFORM_ID } from '@angular/core';
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
    imports: [CommonModule, RouterModule, SharedModule, TranslateModule, LocalizedPipe, ImageUrlPipe]
})
export class BestSellersComponent implements OnInit {
    bestSellers: Product[] = [];
    private contextApplied = false;

    @Input() set data(val: BestSellersSectionData) {
        if (val?.context?.bestSellers !== undefined) {
            this.bestSellers = val.context.bestSellers;
            this.contextApplied = true;
        }
    }

    get bestSellersProducts(): Product[] {
        return this.bestSellers;
    }

    Math = Math;

    constructor(
        private router: Router,
        private productService: ProductService,
        private cartService: CartService,
        private notificationService: NotificationService,
        private translate: TranslateService,
        private favoritesService: FavoritesService,
        @Inject(PLATFORM_ID) private platformId: Object
    ) { }

    ngOnInit(): void {
        if (this.contextApplied) {
            return;
        }

        this.productService.getBestSellers().subscribe({
            next: (products) => {
                this.bestSellers = products;
            },
            error: () => {}
        });
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

    addToCart(product: Product, event: Event): void {
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
