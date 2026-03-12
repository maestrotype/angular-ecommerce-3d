import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Section } from 'src/shared/models/section.model';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { LocalizedString } from 'src/shared/models/localized-string.model';
import { LocalizedPipe } from '../../shared/pipes/localized.pipe';
import { getLocalizedString } from '../../../shared/utils/localization.util';
import { CategoryService } from '../../core/services/category.service';
import { ImageUrlPipe } from '../../shared/pipes/image-url.pipe';
import { ChangeDetectorRef } from '@angular/core';

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
    imports: [CommonModule, TranslateModule, LocalizedPipe, ImageUrlPipe]
})
export class CategoriesComponent implements OnInit {
    @Input() data!: Section;
    categories: CategoryDisplay[] = [];

    constructor(
        private router: Router,
        private categoryService: CategoryService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.loadCategories();
    }

    private findMatchingApiCategory(sectionCategory: any, apiCategories: any[]): any | undefined {
        const sectionSlug = (sectionCategory.slug || '').toString().trim().toLowerCase();

        const sectionNameRaw = typeof sectionCategory.name === 'string'
            ? sectionCategory.name
            : getLocalizedString(sectionCategory.name);
        const sectionName = sectionNameRaw.trim().toLowerCase();

        return apiCategories.find(apiCat => {
            const apiSlug = ((apiCat as any).slug || '').toString().trim().toLowerCase();
            if (sectionSlug && apiSlug && apiSlug === sectionSlug) {
                return true;
            }

            const apiNames = [
                getLocalizedString(apiCat.name, 'en'),
                getLocalizedString(apiCat.name, 'ru'),
                getLocalizedString(apiCat.name, 'ua')
            ]
                .map(name => name.trim().toLowerCase())
                .filter(name => !!name);

            if (sectionName && apiNames.includes(sectionName)) {
                return true;
            }

            return false;
        });
    }

    private loadCategories(): void {
        if (this.data?.settings?.categories && this.data.settings.categories.length > 0) {
            const sectionCategories = this.data.settings.categories
                .filter((cat: any) => cat.isActive !== false);


            this.categoryService.getAllCategories().subscribe({
                next: (apiCategories) => {
                    this.categories = sectionCategories.map((cat: any, index: number) => {
                        const sectionSlug = cat.slug || (cat.name?.en ? cat.name.en.toLowerCase() : '');
                        const nameFromSection = cat.name;

                        // Try to find matching category from API to get the correct icon and status
                        const matchedApiCategory = apiCategories.find((apiCat: any) => apiCat.slug === sectionSlug);

                        const finalIcon = cat.icon || (matchedApiCategory as any)?.icon || 'assets/icons/default-category.svg';

                        const categoryItem = {
                            id: matchedApiCategory ? Number(matchedApiCategory.id) : index + 1,
                            name: cat.name || (matchedApiCategory ? matchedApiCategory.name : nameFromSection),
                            icon: finalIcon,
                            slug: sectionSlug,
                            isActive: cat.isActive ?? (matchedApiCategory ? matchedApiCategory.isActive : true)
                        };
                        return categoryItem;
                    });
                    this.cdr.detectChanges();
                },
                error: (err) => {
                    console.error('Error loading categories from API for section categories:', err);
                    // Graceful fallback: use only section configuration
                    this.categories = sectionCategories.map((cat: any, index: number) => {
                        const name = getLocalizedString(cat.name);
                        return {
                            id: index + 1,
                            name: cat.name,
                            icon: cat.icon,
                            slug: cat.slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
                            isActive: cat.isActive
                        };
                    });
                    this.cdr.detectChanges();
                }
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
                            icon: (cat as any).icon,
                            slug: (cat as any).slug || getLocalizedString(cat.name).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
                            isActive: cat.isActive
                        }));
                    this.cdr.detectChanges();
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