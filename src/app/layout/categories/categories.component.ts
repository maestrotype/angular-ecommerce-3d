import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

interface Category {
    id: number;
    name: string;
    icon: string;
    slug: string;
}

@Component({
    selector: 'app-categories',
    templateUrl: './categories.component.html',
    styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit {
    categories: Category[] = [
        {
            id: 1,
            name: 'Shoes',
            icon: 'assets/icons/shoes.svg',
            slug: 'shoes'
        },
        {
            id: 2,
            name: 'Handbags',
            icon: 'assets/icons/handbags.svg',
            slug: 'handbags'
        },
        {
            id: 3,
            name: 'Clothing',
            icon: 'assets/icons/clothing.svg',
            slug: 'clothing'
        }
    ];

    constructor(private router: Router) { }

    ngOnInit(): void { }

    navigateToCategory(category: Category): void {
        this.router.navigate(['/shop', category.slug]);
    }
}