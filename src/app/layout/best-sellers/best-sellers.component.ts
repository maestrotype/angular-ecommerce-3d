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
    //   bestSellers: Product[] = [
    //     {
    //       id: 1,
    //       name: 'Running Shoes',
    //       price: 99.99,
    //       image: 'assets/images/bag-1.png'
    //     },
    //     {
    //       id: 2,
    //       name: 'Running Shoes',
    //       price: 99.99,
    //       image: 'assets/images/bag-2.png'
    //     },
    //     {
    //       id: 3,
    //       name: 'Running Shoes',
    //       price: 99.99,
    //       image: 'assets/images/bag-3.png'
    //     },
    //     {
    //       id: 4,
    //       name: 'Running Shoes',
    //       price: 99.99,
    //       image: 'assets/images/bag-4.png'
    //     },
    //     {
    //       id: 5,
    //       name: 'Running Shoes',
    //       price: 99.99,
    //       image: 'assets/images/bag-5.png'
    //     },
    //     {
    //       id: 6,
    //       name: 'Running Shoes',
    //       price: 99.99,
    //       image: 'assets/images/bag.png'
    //     }
    //   ];

    constructor(
        private router: Router,
        private productService: ProductService
    ) { }

    ngOnInit(): void {
        this.bestSellers = this.productService.getBestSellers();
    }

    quickView(product: Product): void {
        console.log('Quick view for product:', product);
        // Implement quick view functionality
    }

    goToProductDetail(productId: number): void {
        this.router.navigate(['/product', productId]);
    }
}
