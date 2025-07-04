import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Product } from '../../core/models/Product';
import { ProductService } from '../../core/services/product.service';

@Component({
    selector: 'app-best-sellers',
    templateUrl: './best-sellers.component.html',
    styleUrls: ['./best-sellers.component.scss']
})
export class BestSellersComponent implements OnInit {
    bestSellers: Product[] = [];

    constructor(
        private router: Router,
        private productService: ProductService
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
}
