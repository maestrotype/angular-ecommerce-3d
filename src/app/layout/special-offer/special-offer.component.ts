import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Product } from 'src/app/core/models';
import { ProductService } from 'src/app/core/services/product.service';

@Component({
    selector: 'app-special-offer',
    templateUrl: './special-offer.component.html',
    styleUrls: ['./special-offer.component.scss']
})
export class SpecialOfferComponent implements OnInit {
    specialOffers: Product[] = [];
    constructor(private router: Router, private productService: ProductService) { }

    ngOnInit(): void { 
        this.productService.getSpecialOffers().subscribe({
            next: (products) => this.specialOffers = products,
            error: (err) => {
              console.error('Error loading special offers:', err);
              alert('Error loading special offers.');
            }
          });
    }

    onShopNow(): void {
        this.router.navigate(['/shop']).then(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}
