import { Component, OnInit, Input, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { Product } from 'src/shared/models/product.model';
import { ProductService } from 'src/app/core/services/product.service';
import { Section } from 'src/shared/models/section.model';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-special-offer',
    templateUrl: './special-offer.component.html',
    styleUrls: ['./special-offer.component.scss'],
    standalone: true,
    imports: [CommonModule, RouterModule, SharedModule, TranslateModule]
})
export class SpecialOfferComponent implements OnInit {
    @Input() data!: Section;
    specialOffers: Product[] = [];
    constructor(
        private router: Router,
        private productService: ProductService,
        @Inject(PLATFORM_ID) private platformId: Object
    ) { }

    ngOnInit(): void {
        this.productService.getSpecialOffers().subscribe({
            next: (products) => this.specialOffers = products,
            error: (err) => {
                if (isPlatformBrowser(this.platformId)) {
                    alert('Error loading special offers.');
                }
            }
        });
    }

    onShopNow(): void {
        this.router.navigate(['/shop']).then(() => {
            if (isPlatformBrowser(this.platformId)) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }
}
