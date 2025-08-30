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

    constructor(
        private router: Router,
        private productService: ProductService,
        private cartService: CartService,
        private notificationService: NotificationService
    ) { }

    ngOnInit(): void {
        this.productService.getBestSellers().subscribe({
            next: (products) => this.bestSellers = products,
            error: (err) => {
              console.error('Error loading best sellers:', err);
              alert('Error loading best sellers.');
            }
          });
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
}
