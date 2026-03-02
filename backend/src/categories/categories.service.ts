import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Section } from '../sections/entities/section.entity';
import { Observable, from, throwError } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { extractString, normalizeLocalization } from '../common/utils/localization.util';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Section)
    private sectionRepository: Repository<Section>,
  ) { }

  findAll(): Observable<Category[]> {
    return from(this.categoryRepository.find({ order: { createdAt: 'DESC' } })).pipe(
      catchError(error => {
        console.error('[CategoriesService] Find all error:', error);
        return throwError(() => error);
      })
    );
  }

  findOne(id: string): Observable<Category> {
    return from(this.categoryRepository.findOne({ where: { id } })).pipe(
      map(category => {
        if (!category) {
          throw new NotFoundException('Category not found');
        }
        return category;
      }),
      catchError(error => {
        console.error('[CategoriesService] Find one error:', error);
        return throwError(() => error);
      })
    );
  }

  create(dto: CreateCategoryDto): Observable<Category> {
    // Generate slug from name if not provided
    if (!dto.slug) {
      const nameString = extractString(dto.name);
      dto.slug = nameString.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }

    // Normalize localized fields
    dto.name = normalizeLocalization(dto.name);
    if (dto.description) {
      dto.description = normalizeLocalization(dto.description);
    }

    const category = this.categoryRepository.create(dto as any);

    return from(this.categoryRepository.save(category as any) as Promise<Category>).pipe(
      switchMap((savedCategory: Category) => {
        // Sync with sections
        return from(this.syncWithSections()).pipe(
          map(() => savedCategory)
        );
      }),
      catchError(error => {
        console.error('[CategoriesService] Create error:', error);
        return throwError(() => error);
      })
    );
  }

  update(id: string, dto: UpdateCategoryDto): Observable<Category> {
    return this.findOne(id).pipe(
      switchMap(category => {
        // Generate slug from name if not provided
        if (dto.name && !dto.slug) {
          const nameString = extractString(dto.name);
          dto.slug = nameString.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        }

        // Normalize localized fields if provided
        if (dto.name) {
          dto.name = normalizeLocalization(dto.name);
        }
        if (dto.description) {
          dto.description = normalizeLocalization(dto.description);
        }

        Object.assign(category, dto);

        return from(this.categoryRepository.save(category as any) as Promise<Category>).pipe(
          switchMap((updatedCategory: Category) => {
            // Sync with sections
            return from(this.syncWithSections()).pipe(
              map(() => updatedCategory)
            );
          })
        );
      }),
      catchError(error => {
        console.error('[CategoriesService] Update error:', error);
        return throwError(() => error);
      })
    );
  }

  remove(id: string): Observable<void> {
    return this.findOne(id).pipe(
      switchMap(category => {
        return from(this.categoryRepository.remove(category)).pipe(
          switchMap(() => {
            // Sync with sections
            return from(this.syncWithSections());
          })
        );
      }),
      catchError(error => {
        console.error('[CategoriesService] Remove error:', error);
        return throwError(() => error);
      })
    );
  }

  syncWithSections(): Observable<void> {
    // Get all active categories
    return from(this.categoryRepository.find({
      where: { isActive: true },
      order: { createdAt: 'ASC' }
    })).pipe(
      switchMap(categories => {
        // Find the categories section
        return from(this.sectionRepository.findOne({
          where: { type: 'categories' }
        })).pipe(
          switchMap(categoriesSection => {
            if (!categoriesSection) {
              return throwError(() => new NotFoundException('Categories section not found'));
            }

            // Transform categories to section format with proper slug and icon
            const sectionCategories = categories.map(cat => {
              const nameString = extractString(cat.name);
              const slug = cat.slug || nameString.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
              let icon = cat.icon;

              // Set default icons based on category name
              if (!icon) {
                const nameLower = nameString.toLowerCase();
                switch (nameLower) {
                  case 'shoes':
                    icon = 'assets/icons/shoes.svg';
                    break;
                  case 'handbags':
                    icon = 'assets/icons/handbags.svg';
                    break;
                  case 'clothing':
                    icon = 'assets/icons/clothing.svg';
                    break;
                  case 'auto':
                    icon = 'assets/icons/auto.svg';
                    break;
                  default:
                    icon = 'assets/icons/default-category.svg';
                }
              }

              return {
                name: cat.name,
                slug: slug,
                icon: icon,
                isActive: cat.isActive
              };
            });

            // Update section settings
            categoriesSection.settings = {
              ...categoriesSection.settings,
              categories: sectionCategories
            };

            return from(this.sectionRepository.save(categoriesSection as any) as Promise<Section>).pipe(
              map(() => void 0)
            );
          }),
          catchError(error => {
            console.error('[CategoriesService] Sync with sections error:', error);
            return throwError(() => error);
          })
        );
      }),
      catchError(error => {
        console.error('[CategoriesService] Sync with sections error:', error);
        return throwError(() => error);
      })
    );
  }
}