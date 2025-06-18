import { Component, OnInit } from '@angular/core';

interface Brand {
    id: number;
    name: string;
    logo: string;
}

@Component({
    selector: 'app-brands',
    templateUrl: './brands.component.html',
    styleUrls: ['./brands.component.scss']
})
export class BrandsComponent implements OnInit {
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

    ngOnInit(): void { }
}