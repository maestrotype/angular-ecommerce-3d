import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Product } from 'src/shared/models/product.model';
import { ProductService } from 'src/app/core/services/product.service';
import { Section } from 'src/shared/models/section.model';

@Component({
    selector: 'app-special-offer',
    templateUrl: './special-offer.component.html',
    styleUrls: ['./special-offer.component.scss']
})
export class SpecialOfferComponent implements OnInit {
    @Input() data!: Section;
    specialOffers: Product[] = [];
    constructor(private router: Router, private productService: ProductService) { }

    ngOnInit(): void { 
        this.productService.getSpecialOffers().subscribe({
            next: (products) => this.specialOffers = products,
            error: (err) => {
              console.error('Error loading special offers:', err);
              // Error handling is now done in the service with fallback data
            }
          });
    }

    onShopNow(): void {
        this.router.navigate(['/shop']).then(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}
