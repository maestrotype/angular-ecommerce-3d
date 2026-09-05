import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of, forkJoin, Subject, throwError, timer } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';
import { Product } from 'src/shared/models/product.model';
import { environment } from "src/environments/environment";
import { BestSellersCatalogSettingsService } from './best-sellers-catalog-settings.service';
import {
  filterProductsByCategorySlugs,
  sortProductsByAdminSort,
} from '../../../shared/utils/shop-catalog.util';
import { getDemoProductById, getDemoProducts } from '../../../shared/constants/demo-catalog';
import { DemoCatalogStateService } from './demo-catalog-state.service';
import { isDemoProductId } from '../../../shared/utils/demo-catalog.util';
import { StorefrontCatalogCacheService } from './storefront-catalog-cache.service';
import { STOREFRONT_DEMO_DELAY_MS } from '../../../shared/utils/storefront-catalog-stream.util';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly API_URL = environment.apiUrl;
  private readonly PRODUCTS_CACHE_KEY = 'products';

  private cartSubject = new BehaviorSubject<Product[]>([]);
  cart$ = this.cartSubject.asObservable();

  private readonly catalogChangedSubject = new Subject<void>();
  readonly catalogChanged$ = this.catalogChangedSubject.asObservable();

  private readonly productsSubject = new BehaviorSubject<Product[] | null>(null);
  private productsBootstrapped = false;

  notifyCatalogChanged(): void {
    this.catalogChangedSubject.next();
  }

  constructor(
    private http: HttpClient,
    private bestSellersCatalogSettingsService: BestSellersCatalogSettingsService,
    private demoCatalogState: DemoCatalogStateService,
    private catalogCache: StorefrontCatalogCacheService,
  ) { }

  getProducts(): Observable<Product[]> {
    this.bootstrapProductsIfNeeded();
    return this.productsSubject.pipe(
      filter((products): products is Product[] => products !== null),
    );
  }

  getProductById(id: number): Observable<Product> {
    if (isDemoProductId(id)) {
      const demo = getDemoProductById(id);
      return demo ? of(demo) : throwError(() => new Error('Demo product not found'));
    }

    const cached = this.catalogCache.read<Product[]>(this.PRODUCTS_CACHE_KEY);
    const cachedProduct = cached?.find((product) => product.id === id);
    if (cachedProduct) {
      this.refreshProductInBackground(id);
      return of({ ...cachedProduct });
    }

    return this.http.get<Product>(`${this.API_URL}/products/${id}`);
  }

  getSpecialOffers(): Observable<Product[]> {
    return this.getProducts().pipe(
      map((products) => products.filter((product) => product.isSpecial)),
    );
  }

  getBestSellers(): Observable<Product[]> {
    return forkJoin({
      products: this.getProducts().pipe(take(1)),
      settings: this.bestSellersCatalogSettingsService.getSettings(),
    }).pipe(
      map(({ products, settings }) => {
        let result = [...products];

        if (settings.enabled) {
          result = filterProductsByCategorySlugs(result, settings.categories);
          result = sortProductsByAdminSort(result, settings.sortOrder);
          return result;
        }

        return result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      }),
    );
  }

  searchProducts(searchTerm: string): Observable<Product[]> {
    const query = searchTerm.trim().toLowerCase();
    if (!query) {
      return of([]);
    }

    return this.getProducts().pipe(
      map((products) =>
        products.filter((product) => {
          const name = typeof product.name === 'string'
            ? product.name
            : Object.values(product.name || {}).join(' ');
          return (
            name.toLowerCase().includes(query) ||
            (product.category || '').toLowerCase().includes(query)
          );
        }),
      ),
    );
  }

  private bootstrapProductsIfNeeded(): void {
    if (this.productsBootstrapped) {
      return;
    }
    this.productsBootstrapped = true;

    const cached = this.catalogCache.read<Product[]>(this.PRODUCTS_CACHE_KEY);
    if (cached?.length) {
      this.productsSubject.next(cached);
      this.demoCatalogState.setDemoMode(false);
    }

    this.http.get<Product[]>(`${this.API_URL}/products`).pipe(take(1)).subscribe({
      next: (products) => this.applyLiveProducts(products),
      error: () => {},
    });

    if (!cached?.length) {
      this.scheduleDemoProductsFallback();
    }
  }

  private scheduleDemoProductsFallback(): void {
    timer(STOREFRONT_DEMO_DELAY_MS).subscribe(() => {
      const current = this.productsSubject.value;
      if (current !== null && current.length > 0) {
        const isDemoOnly = current.every((product) => product.isDemo === true || product.id < 0);
        if (!isDemoOnly) {
          return;
        }
      }
      this.productsSubject.next(getDemoProducts());
      this.demoCatalogState.setDemoMode(true);
    });
  }

  private applyLiveProducts(products: Product[]): void {
    if (!products?.length) {
      return;
    }
    this.catalogCache.write(this.PRODUCTS_CACHE_KEY, products);
    this.productsSubject.next(products);
    this.demoCatalogState.setDemoMode(false);
  }

  private refreshProductInBackground(id: number): void {
    this.http.get<Product>(`${this.API_URL}/products/${id}`).pipe(take(1)).subscribe({
      next: (product) => {
        const cached = this.catalogCache.read<Product[]>(this.PRODUCTS_CACHE_KEY) || [];
        const next = cached.some((item) => item.id === product.id)
          ? cached.map((item) => (item.id === product.id ? product : item))
          : [...cached, product];
        this.catalogCache.write(this.PRODUCTS_CACHE_KEY, next);
        if (this.productsSubject.value !== null) {
          this.productsSubject.next(next);
        }
      },
      error: () => {},
    });
  }
}
