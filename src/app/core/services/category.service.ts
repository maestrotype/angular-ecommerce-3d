import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, timer } from 'rxjs';
import { catchError, filter, take } from 'rxjs/operators';
import { Category } from 'src/shared/models/category.model';
import { environment } from '../../../environments/environment';
import { getDemoCategories } from '../../../shared/constants/demo-catalog';
import { DemoCatalogStateService } from './demo-catalog-state.service';
import { StorefrontCatalogCacheService } from './storefront-catalog-cache.service';
import { STOREFRONT_DEMO_DELAY_MS } from '../../../shared/utils/storefront-catalog-stream.util';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private readonly API_URL = environment.apiUrl + '/categories';
  private readonly CATEGORIES_CACHE_KEY = 'categories';

  private readonly categoriesSubject = new BehaviorSubject<Category[] | null>(null);
  private categoriesBootstrapped = false;

  constructor(
    private http: HttpClient,
    private demoCatalogState: DemoCatalogStateService,
    private catalogCache: StorefrontCatalogCacheService,
  ) {}

  getAllCategories(): Observable<Category[]> {
    this.bootstrapCategoriesIfNeeded();
    return this.categoriesSubject.pipe(
      filter((categories): categories is Category[] => categories !== null),
    );
  }

  getCategoryById(id: string): Observable<Category> {
    return this.http.get<Category>(`${this.API_URL}/${id}`)
      .pipe(catchError(this.handleError));
  }

  createCategory(category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Observable<Category> {
    return this.http.post<Category>(this.API_URL, category)
      .pipe(catchError(this.handleError));
  }

  updateCategory(id: string, category: Partial<Category>): Observable<Category> {
    return this.http.patch<Category>(`${this.API_URL}/${id}`, category)
      .pipe(catchError(this.handleError));
  }

  deleteCategory(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`)
      .pipe(catchError(this.handleError));
  }

  syncCategoriesWithSections(): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/sync-with-sections`, {})
      .pipe(catchError(this.handleError));
  }

  private bootstrapCategoriesIfNeeded(): void {
    if (this.categoriesBootstrapped) {
      return;
    }
    this.categoriesBootstrapped = true;

    const cached = this.catalogCache.read<Category[]>(this.CATEGORIES_CACHE_KEY);
    if (cached?.length) {
      this.categoriesSubject.next(cached);
      this.demoCatalogState.setDemoMode(false);
    }

    this.http.get<Category[]>(this.API_URL).pipe(take(1)).subscribe({
      next: (categories) => this.applyLiveCategories(categories),
      error: () => {},
    });

    if (!cached?.length) {
      this.scheduleDemoCategoriesFallback();
    }
  }

  private scheduleDemoCategoriesFallback(): void {
    timer(STOREFRONT_DEMO_DELAY_MS).subscribe(() => {
      const current = this.categoriesSubject.value;
      if (current !== null && current.length > 0) {
        return;
      }
      this.categoriesSubject.next(getDemoCategories());
      this.demoCatalogState.setDemoMode(true);
    });
  }

  private applyLiveCategories(categories: Category[]): void {
    if (!categories?.length) {
      if (this.categoriesSubject.value === null) {
        this.categoriesSubject.next([]);
      }
      return;
    }
    this.catalogCache.write(this.CATEGORIES_CACHE_KEY, categories);
    this.categoriesSubject.next(categories);
    this.demoCatalogState.setDemoMode(false);
  }

  private handleError(error: any) {
    let message = 'Unknown error';
    if (error.error?.message) {
      message = error.error.message;
    } else if (error.message) {
      message = error.message;
    }
    return throwError(() => ({ ...error, friendlyMessage: message }));
  }
}
