import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Product } from 'src/shared/models/product.model';
import { ProductService } from '../../core/services/product.service';
import { Section } from 'src/shared/models/section.model';
import { CartService } from '../../core/services/cart.service';
import { NotificationService } from '../../core/services/notification.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
    selector: 'app-best-sellers',
    templateUrl: './best-sellers.component.html',
    styleUrls: ['./best-sellers.component.scss'],
    standalone: true,
    imports: [CommonModule, RouterModule, SharedModule]
})
export class BestSellersComponent implements OnInit {
    @Input() data!: Section;
    bestSellers: Product[] = [];

    // Alias for template compatibility
    get bestSellersProducts(): Product[] {
        return this.bestSellers;
    }

    // Math object for template usage
    Math = Math;

    constructor(
        private router: Router,
        private productService: ProductService,
        private cartService: CartService,
        private notificationService: NotificationService
    ) { }

    ngOnInit(): void {
        this.productService.getBestSellers().subscribe({
            next: (products) => {
                this.bestSellers = products;
            },
            error: (err) => {

            }
        });
    }

    // TrackBy function for performance
    trackByProductId(index: number, product: Product): number {
        return product.id;
    }

    quickView(product: Product): void {

        // Implement quick view functionality
    }

    goToProductDetail(productId: number): void {
        this.router.navigate(['/product', productId]).then(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
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
        this.notificationService.showSuccess(`Added ${product.name} to cart!`);

    }

    onFavoriteToggled(event: any): void {

        // Implement favorite functionality
    }

    isFavorite(productId: number): boolean {
        // TODO: Implement favorite service
        return false;
    }

    toggleFavorite(product: Product): void {
        // TODO: Implement favorite service

    }

    // Rating functionality
    rateProduct(product: Product, rating: number): void {
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

    private updateProductRating(product: Product): void {
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
}
