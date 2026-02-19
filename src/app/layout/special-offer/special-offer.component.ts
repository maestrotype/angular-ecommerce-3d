import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Product } from 'src/shared/models/product.model';
import { ProductService } from 'src/app/core/services/product.service';
import { Section } from 'src/shared/models/section.model';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
    selector: 'app-special-offer',
    templateUrl: './special-offer.component.html',
    styleUrls: ['./special-offer.component.scss'],
    standalone: true,
    imports: [CommonModule, RouterModule, SharedModule]
})
export class SpecialOfferComponent implements OnInit {
    @Input() data!: Section;
    specialOffers: Product[] = [];
    constructor(private router: Router, private productService: ProductService) { }

    ngOnInit(): void {
        this.productService.getSpecialOffers().subscribe({
            next: (products) => this.specialOffers = products,
            error: (err) => {

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
