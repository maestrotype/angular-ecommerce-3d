import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Product } from 'src/shared/models/product.model';
import { ProductService } from '../../core/services/product.service';
import { Section } from 'src/shared/models/section.model';
import { ModalService } from '../../core/services/modal.service';

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
        private modalService: ModalService
    ) { }

    ngOnInit(): void {
        this.productService.getBestSellers().subscribe({
            next: (products) => this.bestSellers = products,
            error: (err) => {
              console.error('Error loading best sellers:', err);
              this.modalService.showError('Error', 'Failed to load best sellers', err.message, 'storefront');
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
