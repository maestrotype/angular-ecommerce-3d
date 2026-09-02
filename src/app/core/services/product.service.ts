import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { Product } from 'src/shared/models/product.model';
import { environment } from "src/environments/environment";
import { BestSellersCatalogSettingsService } from './best-sellers-catalog-settings.service';
import { CatalogRefreshService } from './catalog-refresh.service';
import {
  filterProductsByCategorySlugs,
  sortProductsByAdminSort,
} from '../../../shared/utils/shop-catalog.util';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly API_URL = environment.apiUrl;

  private cartSubject = new BehaviorSubject<Product[]>([]);
  cart$ = this.cartSubject.asObservable();

  constructor(
    private http: HttpClient,
    private bestSellersCatalogSettingsService: BestSellersCatalogSettingsService,
    private catalogRefresh: CatalogRefreshService,
  ) { }

  get catalogChanged$() {
    return this.catalogRefresh.changed$;
  }

  notifyCatalogChanged(): void {
    this.catalogRefresh.notify();
  }

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.API_URL}/products`);
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.API_URL}/products/${id}`);
  }

  getSpecialOffers(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.API_URL}/products?isSpecial=true`);
  }

  getBestSellers(): Observable<Product[]> {
    return forkJoin({
      products: this.getProducts(),
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
    return this.http.get<Product[]>(`${this.API_URL}/products/search?search=${encodeURIComponent(searchTerm)}`);
  }
}