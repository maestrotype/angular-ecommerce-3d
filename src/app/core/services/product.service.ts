import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { Product } from 'src/shared/models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly API_URL = 'https://angular-ecommerce-backend.onrender.com/api';
  
  private cartSubject = new BehaviorSubject<Product[]>([]);
  cart$ = this.cartSubject.asObservable();
  
  constructor(private http: HttpClient) {}

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
    return this.http.get<Product[]>(`${this.API_URL}/products?sort=rating&limit=4`);
  }

  searchProducts(searchTerm: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.API_URL}/products?search=${encodeURIComponent(searchTerm)}`);
  }
}