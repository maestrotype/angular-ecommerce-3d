import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import {
  Product,
  ProductCreateRequest,
  ProductUpdateRequest,
} from "../models/product.model";
import { environment } from '../../environments/environment';
import { PROD_API_URL } from '../../app/core/utils/api-url.util';

@Injectable({
  providedIn: "root",
})
export class ProductService {
  private get API_URL(): string {
    return environment.apiUrl;
  }

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      "Content-Type": "application/json",
    });
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem("adminToken");
    return new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    });
  }

  private getUploadHeaders(): HttpHeaders {
    const token = localStorage.getItem("adminToken");
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
    const url = `${this.API_URL}${endpoint}`;
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
      .get<Product[]>(`${this.API_URL}/products`)
      .pipe(catchError(() => this.fallback<Product[]>("/products", "GET")));
  }

  getProductById(id: number): Observable<Product> {
    return this.http
      .get<Product>(`${this.API_URL}/products/${id}`)
      .pipe(catchError(() => this.fallback<Product>(`/products/${id}`, "GET")));
  }

  getProductsByCategory(category: string): Observable<Product[]> {
    return this.http
      .get<Product[]>(`${this.API_URL}/products?category=${category}`)
      .pipe(
        catchError(() =>
          this.fallback<Product[]>(`/products?category=${category}`, "GET")
        )
      );
  }

  getFeaturedProducts(): Observable<Product[]> {
    return this.http
      .get<Product[]>(`${this.API_URL}/products/featured`)
      .pipe(
        catchError(() => this.fallback<Product[]>("/products/featured", "GET"))
      );
  }

  createProduct(product: ProductCreateRequest): Observable<Product> {
    const headers = this.getHeaders();
    return this.http
      .post<Product>(`${this.API_URL}/products`, product, { headers })
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
      .patch<Product>(`${this.API_URL}/products/${id}`, product, {
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
      .delete<void>(`${this.API_URL}/products/${id}`, { headers })
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
      `${this.API_URL}/products/upload`,
      formData
    );
  }

  upload3dModel(file: File, apiBase?: string): Observable<{ url: string; publicId: string; localPath?: string }> {
    const formData = new FormData();
    formData.append('model', file);
    const base = apiBase || this.API_URL;
    return this.http.post<{ url: string; publicId: string; localPath?: string }>(
      `${base}/uploads/product-3d-model`,
      formData,
      { headers: this.getUploadHeaders() },
    );
  }

  /** Always uploads via production Render backend → Cloudinary (required for GitHub Pages). */
  upload3dModelToCloudinary(file: File): Observable<{ url: string; publicId: string; localPath?: string }> {
    return this.upload3dModel(file, PROD_API_URL);
  }

  updateProductOnApi(
    apiBase: string,
    id: number,
    product: ProductUpdateRequest,
  ): Observable<Product> {
    const headers = this.getHeaders();
    return this.http.patch<Product>(`${apiBase}/products/${id}`, product, { headers });
  }

  updateProductOnProduction(id: number, product: ProductUpdateRequest): Observable<Product> {
    return this.updateProductOnApi(PROD_API_URL, id, product);
  }

  // New method to move local file to Cloudinary
  archiveLocalModel(localPath: string, apiBase?: string): Observable<{ url: string; publicId: string; localPath?: string }> {
    const base = apiBase || this.API_URL;
    return this.http.post<{ url: string; publicId: string; localPath?: string }>(
      `${base}/uploads/archive-local`,
      { path: localPath },
      { headers: this.getUploadHeaders() },
    );
  }

  archiveLocalModelOnProduction(localPath: string): Observable<{ url: string; publicId: string; localPath?: string }> {
    return this.archiveLocalModel(localPath, PROD_API_URL);
  }
}
