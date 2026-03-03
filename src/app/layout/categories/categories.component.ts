import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Section } from 'src/shared/models/section.model';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { LocalizedString } from 'src/shared/models/localized-string.model';
import { LocalizedPipe } from '../../shared/pipes/localized.pipe';
import { getLocalizedString } from '../../../shared/utils/localization.util';
import { CategoryService } from '../../core/services/category.service';

interface CategoryDisplay {
    id?: number;
    name: string | LocalizedString;
    icon: string;
    slug?: string;
    isActive?: boolean;
}

@Component({
    selector: 'app-categories',
    templateUrl: './categories.component.html',
    styleUrls: ['./categories.component.scss'],
    standalone: true,
    imports: [CommonModule, TranslateModule, LocalizedPipe]
})
export class CategoriesComponent implements OnInit {
    @Input() data!: Section;
    categories: CategoryDisplay[] = [];

    constructor(private router: Router, private categoryService: CategoryService) { }

    ngOnInit(): void {
        this.loadCategories();
    }

    private loadCategories(): void {
        if (this.data?.settings?.categories && this.data.settings.categories.length > 0) {
            this.categories = this.data.settings.categories
                .filter((cat: any) => cat.isActive !== false)
                .map((cat: any, index: number) => {
                    const name = getLocalizedString(cat.name);
                    return {
                        id: index + 1,
                        name: cat.name,
                        icon: cat.icon || 'assets/icons/default-category.svg',
                        slug: cat.slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
                        isActive: cat.isActive
                    };
                });
        } else {
            // Fallback: load active categories directly from the categories API
            this.categoryService.getAllCategories().subscribe({
                next: (cats) => {
                    this.categories = cats
                        .filter(cat => cat.isActive !== false)
                        .map(cat => ({
                            id: Number(cat.id),
                            name: cat.name,
                            icon: (cat as any).icon || 'assets/icons/default-category.svg',
                            slug: (cat as any).slug || getLocalizedString(cat.name).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
                            isActive: cat.isActive
                        }));
                },
                error: (err) => {
                    console.error('Error loading categories from API:', err);
                }
            });
        }
    }

    navigateToCategory(category: CategoryDisplay): void {
        const nameStr = getLocalizedString(category.name);
        const slug = category.slug || nameStr.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        this.router.navigate(['/shop'], {
            queryParams: { category: slug }
        });
    }
}