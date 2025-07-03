import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import {
  Product,
  ProductCreateRequest,
  ProductUpdateRequest,
} from "../models/product.model";

@Injectable({
  providedIn: "root",
})
export class ProductService {
  private readonly FALLBACK_API = "http://localhost:3002/api";
  private readonly PRIMARY_API =
    "https://angular-ecommerce-backend.onrender.com/api";

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      "Content-Type": "application/json",
    });
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem("admin_token");
    return new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    });
  }

  private getUploadHeaders(): HttpHeaders {
    const token = localStorage.getItem("admin_token");
    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : "",
    });
  }

  private fallback<T>(
    endpoint: string,
    method: "GET" | "POST" | "PATCH" | "DELETE",
    body?: any,
    headers?: HttpHeaders
  ): Observable<T> {
    const url = `${this.FALLBACK_API}${endpoint}`;
    const options = headers ? { headers } : {};

    switch (method) {
      case "GET":
        return this.http.get<T>(url, options);
      case "POST":
        return this.http.post<T>(url, body, options);
      case "PATCH":
        return this.http.patch<T>(url, body, options);
      case "DELETE":
        return this.http.delete<T>(url, options);
      default:
        return throwError(() => new Error(`Unsupported method: ${method}`));
    }
  }

  getAllProducts(): Observable<Product[]> {
    return this.http
      .get<Product[]>(`${this.PRIMARY_API}/products`)
      .pipe(catchError(() => this.fallback<Product[]>("/products", "GET")));
  }

  getProductById(id: number): Observable<Product> {
    return this.http
      .get<Product>(`${this.PRIMARY_API}/products/${id}`)
      .pipe(catchError(() => this.fallback<Product>(`/products/${id}`, "GET")));
  }

  getProductsByCategory(category: string): Observable<Product[]> {
    return this.http
      .get<Product[]>(`${this.PRIMARY_API}/products?category=${category}`)
      .pipe(
        catchError(() =>
          this.fallback<Product[]>(`/products?category=${category}`, "GET")
        )
      );
  }

  getFeaturedProducts(): Observable<Product[]> {
    return this.http
      .get<Product[]>(`${this.PRIMARY_API}/products/featured`)
      .pipe(
        catchError(() => this.fallback<Product[]>("/products/featured", "GET"))
      );
  }

  createProduct(product: ProductCreateRequest): Observable<Product> {
    const headers = this.getHeaders();
    return this.http
      .post<Product>(`${this.PRIMARY_API}/products`, product, { headers })
      .pipe(
        catchError(() =>
          this.fallback<Product>("/products", "POST", product, headers)
        )
      );
  }

  updateProduct(
    id: number,
    product: ProductUpdateRequest
  ): Observable<Product> {
    const headers = this.getHeaders();
    return this.http
      .patch<Product>(`${this.PRIMARY_API}/products/${id}`, product, {
        headers,
      })
      .pipe(
        catchError(() =>
          this.fallback<Product>(`/products/${id}`, "PATCH", product, headers)
        )
      );
  }

  deleteProduct(id: number): Observable<void> {
    const headers = this.getHeaders();
    return this.http
      .delete<void>(`${this.PRIMARY_API}/products/${id}`, { headers })
      .pipe(
        catchError(() =>
          this.fallback<void>(`/products/${id}`, "DELETE", null, headers)
        )
      );
  }

  uploadImage(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append("image", file);
    return this.http.post<{ url: string }>(
      `${this.PRIMARY_API}/products/upload`,
      formData
    );
  }
}
