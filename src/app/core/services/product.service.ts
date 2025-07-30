import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Product } from 'src/shared/models/product.model';
import { environment } from "src/environments/environment.prod";
import { ModalService } from './modal.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly API_URL = environment.apiUrl;
  
  private cartSubject = new BehaviorSubject<Product[]>([]);
  cart$ = this.cartSubject.asObservable();
  
  constructor(
    private http: HttpClient,
    private modalService: ModalService
  ) {}

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.API_URL}/products`).pipe(
      catchError(error => {
        this.modalService.showWarning(
          'Backend Unavailable',
          'The server is currently unavailable. Some features may not work properly.',
          'Using fallback data for demonstration purposes.',
          'storefront'
        );
        return of(this.getMockProducts());
      })
    );
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.API_URL}/products/${id}`).pipe(
      catchError(error => {
        this.modalService.showWarning(
          'Backend Unavailable',
          'The server is currently unavailable. Some features may not work properly.',
          'Using fallback data for demonstration purposes.',
          'storefront'
        );
        const mockProduct = this.getMockProducts().find(p => p.id === id);
        return of(mockProduct || this.getMockProducts()[0]);
      })
    );
  }
  
  getSpecialOffers(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.API_URL}/products?isSpecial=true`).pipe(
      catchError(error => {
        this.modalService.showWarning(
          'Backend Unavailable',
          'The server is currently unavailable. Some features may not work properly.',
          'Using fallback data for demonstration purposes.',
          'storefront'
        );
        return of(this.getMockProducts().filter(p => p.isSpecial));
      })
    );
  }
  
  getBestSellers(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.API_URL}/products?sort=rating&limit=4`).pipe(
      catchError(error => {
        this.modalService.showWarning(
          'Backend Unavailable',
          'The server is currently unavailable. Some features may not work properly.',
          'Using fallback data for demonstration purposes.',
          'storefront'
        );
        return of(this.getMockProducts().slice(0, 4));
      })
    );
  }

  searchProducts(searchTerm: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.API_URL}/products?search=${encodeURIComponent(searchTerm)}`).pipe(
      catchError(error => {
        this.modalService.showWarning(
          'Backend Unavailable',
          'The server is currently unavailable. Some features may not work properly.',
          'Using fallback data for demonstration purposes.',
          'storefront'
        );
        const mockProducts = this.getMockProducts();
        return of(mockProducts.filter(p => 
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description.toLowerCase().includes(searchTerm.toLowerCase())
        ));
      })
    );
  }

  private getMockProducts(): Product[] {
    return [
      {
        id: 1,
        name: "Premium Leather Handbag",
        description: "Elegant leather handbag with modern design",
        price: 299.99,
        imageUrl: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=400&fit=crop",
        category: "Handbags",
        stock: 15,
        rating: 4.8,
        isSpecial: true,
        discount: 15
      },
      {
        id: 2,
        name: "Designer Sunglasses",
        description: "Stylish sunglasses with UV protection",
        price: 199.99,
        imageUrl: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop",
        category: "Accessories",
        stock: 25,
        rating: 4.6,
        isSpecial: false,
        discount: 0
      },
      {
        id: 3,
        name: "Casual Denim Jacket",
        description: "Comfortable denim jacket for everyday wear",
        price: 89.99,
        imageUrl: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400&h=400&fit=crop",
        category: "Clothing",
        stock: 30,
        rating: 4.7,
        isSpecial: true,
        discount: 20
      },
      {
        id: 4,
        name: "Luxury Watch",
        description: "Premium timepiece with elegant design",
        price: 599.99,
        imageUrl: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=400&fit=crop",
        category: "Accessories",
        stock: 8,
        rating: 4.9,
        isSpecial: false,
        discount: 0
      }
    ];
  }
}