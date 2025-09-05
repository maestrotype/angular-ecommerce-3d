import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Product } from 'src/shared/models/product.model';
import { ProductService } from '../../core/services/product.service';
import { Section } from 'src/shared/models/section.model';
import { CartService } from '../../core/services/cart.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
    selector: 'app-best-sellers',
    templateUrl: './best-sellers.component.html',
    styleUrls: ['./best-sellers.component.scss']
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
        console.log('BestSellersComponent ngOnInit called');
        this.productService.getBestSellers().subscribe({
            next: (products) => {
                console.log('Best sellers loaded:', products);
                this.bestSellers = products;
                
                // Fallback data for testing if API returns empty array
                if (products.length === 0) {
                    console.log('No products from API, using fallback data');
                    this.bestSellers = this.getFallbackProducts();
                }
            },
            error: (err) => {
              console.error('Error loading best sellers:', err);
              console.log('Using fallback data due to error');
              this.bestSellers = this.getFallbackProducts();
            }
          });
    }

    private getFallbackProducts(): Product[] {
        return [
            {
                id: 1,
                name: 'Test Product 1',
                price: 99.99,
                imageUrl: 'https://via.placeholder.com/300x300?text=Product+1',
                category: 'Electronics',
                description: 'Test product description',
                stock: 10,
                rating: 4.5,
                ratingCount: 100,
                isSpecial: false,
                isNew: true,
                discount: 0,
                originalPrice: 0
            },
            {
                id: 2,
                name: 'Test Product 2',
                price: 149.99,
                imageUrl: 'https://via.placeholder.com/300x300?text=Product+2',
                category: 'Electronics',
                description: 'Test product description',
                stock: 5,
                rating: 4.8,
                ratingCount: 50,
                isSpecial: true,
                isNew: false,
                discount: 20,
                originalPrice: 187.49
            },
            {
                id: 3,
                name: 'Test Product 3',
                price: 79.99,
                imageUrl: 'https://via.placeholder.com/300x300?text=Product+3',
                category: 'Accessories',
                description: 'Test product description',
                stock: 15,
                rating: 4.2,
                ratingCount: 75,
                isSpecial: false,
                isNew: false,
                discount: 0,
                originalPrice: 0
            },
            {
                id: 4,
                name: 'Test Product 4',
                price: 199.99,
                imageUrl: 'https://via.placeholder.com/300x300?text=Product+4',
                category: 'Electronics',
                description: 'Test product description',
                stock: 0,
                rating: 4.9,
                ratingCount: 200,
                isSpecial: true,
                isNew: false,
                discount: 15,
                originalPrice: 235.29
            }
        ];
    }

    // TrackBy function for performance
    trackByProductId(index: number, product: Product): number {
        return product.id;
    }

    quickView(product: Product): void {
        console.log('Quick view for product:', product);
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
        console.log('Added to cart:', product.name);
    }

    onFavoriteToggled(event: any): void {
        console.log('Favorite toggled:', event);
        // Implement favorite functionality
    }

    isFavorite(productId: number): boolean {
        // TODO: Implement favorite service
        return false;
    }

    toggleFavorite(product: Product): void {
        // TODO: Implement favorite service
        console.log('Toggle favorite for product:', product.name);
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
        
        console.log(`Product ${product.name} rated with ${rating} stars`);
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
