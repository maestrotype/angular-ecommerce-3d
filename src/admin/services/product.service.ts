
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, ProductCreateRequest, ProductUpdateRequest } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly API_URL = 'https://angular-ecommerce-backend.onrender.com/api';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('admin_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  getAllProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.API_URL}/products`);
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.API_URL}/products/${id}`);
  }

  getProductsByCategory(category: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.API_URL}/products?category=${category}`);
  }

  getFeaturedProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.API_URL}/products/featured`);
  }

  createProduct(product: ProductCreateRequest): Observable<Product> {
    return this.http.post<Product>(`${this.API_URL}/products`, product, {
      headers: this.getHeaders()
    });
  }

  updateProduct(id: number, product: ProductUpdateRequest): Observable<Product> {
    return this.http.patch<Product>(`${this.API_URL}/products/${id}`, product, {
      headers: this.getHeaders()
    });
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/products/${id}`, {
      headers: this.getHeaders()
    });
  }
}
