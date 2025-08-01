import { Component, OnInit, Input } from '@angular/core';
import { Section } from 'src/shared/models/section.model';

interface Brand {
    id: number;
    name: string;
    logo: string;
    isActive?: boolean;
}

@Component({
    selector: 'app-brands',
    templateUrl: './brands.component.html',
    styleUrls: ['./brands.component.scss']
})
export class BrandsComponent implements OnInit {
    @Input() data!: Section;
    brands: Brand[] = [
        {
            id: 1,
            name: 'Nike',
            logo: 'assets/icons/nike.svg'
        },
        {
            id: 2,
            name: 'Puma',
            logo: 'assets/icons/puma.svg'
        },
        {
            id: 3,
            name: 'Under Armour',
            logo: 'assets/icons/under-armour.svg'
        },
        {
            id: 4,
            name: 'Chanel',
            logo: 'assets/icons/chanel.svg'
        },
        {
            id: 5,
            name: 'Reebok',
            logo: 'assets/icons/reebok.svg'
        },
        {
            id: 6,
            name: 'Zara',
            logo: 'assets/icons/zara.svg'
        }
    ];

    constructor() { }

    ngOnInit(): void {
        this.loadBrands();
    }

    private loadBrands(): void {
        if (this.data?.settings?.brands && this.data.settings.brands.length > 0) {
            this.brands = this.data.settings.brands
                .filter(brand => brand.isActive !== false)
                .map((brand, index) => ({
                    id: index + 1,
                    name: brand.name,
                    logo: brand.logo || 'assets/icons/default-brand.svg',
                    isActive: brand.isActive
                }));
        } else {
            this.brands;
        }
    }
}