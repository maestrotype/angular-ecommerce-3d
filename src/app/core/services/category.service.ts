import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Category } from 'src/shared/models/category.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private readonly API_URL = environment.apiUrl + '/categories';

  constructor(private http: HttpClient) {}

  getAllCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.API_URL)
      .pipe(
        catchError(error => {
          
          return throwError(() => error);
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

  // Sync categories with sections
  syncCategoriesWithSections(): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/sync-with-sections`, {})
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