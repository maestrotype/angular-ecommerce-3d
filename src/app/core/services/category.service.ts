import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Category } from 'src/shared/models/category.model';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private readonly API_URL = environment.apiUrl + '/categories';

  private fallbackCategories: Category[] = [
    { id: 'all', name: 'All Categories', slug: 'all', icon: 'assets/icons/all.svg' },
    { id: 'handbags', name: 'Handbags', slug: 'handbags', icon: 'assets/icons/handbags.svg' },
    { id: 'shoes', name: 'Shoes', slug: 'shoes', icon: 'assets/icons/shoes.svg' },
    { id: 'clothing', name: 'Clothing', slug: 'clothing', icon: 'assets/icons/clothing.svg'}
  ];

  constructor(private http: HttpClient) {}

  getAllCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.API_URL)
      .pipe(
        catchError(error => {
          console.warn('Failed to fetch categories from API, using fallback:', error);
          return of(this.fallbackCategories);
        })
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