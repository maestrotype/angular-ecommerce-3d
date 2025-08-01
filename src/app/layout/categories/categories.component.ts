import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Section } from 'src/shared/models/section.model';

interface CategoryDisplay {
    id?: number;
    name: string;
    icon: string;
    slug?: string;
    isActive?: boolean;
}

@Component({
    selector: 'app-categories',
    templateUrl: './categories.component.html',
    styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit {
    @Input() data!: Section;
    categories: CategoryDisplay[] = [];

    constructor(private router: Router) { }

    ngOnInit(): void {
        this.loadCategories();
    }

    private loadCategories(): void {
        if (this.data?.settings?.categories && this.data.settings.categories.length > 0) {
            this.categories = this.data.settings.categories
                .filter(cat => cat.isActive !== false)
                .map((cat, index) => ({
                    id: index + 1,
                    name: cat.name,
                    icon: cat.icon || 'assets/icons/default-category.svg',
                    slug: cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
                    isActive: cat.isActive
                }));
        } else {
            this.categories = [];
        }
    }

    navigateToCategory(category: CategoryDisplay): void {
        const slug = category.slug || category.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        this.router.navigate(['/shop'], { 
            queryParams: { category: slug } 
        });
    }
}