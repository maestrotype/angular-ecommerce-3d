import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Category } from 'src/shared/models/category.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private readonly API_URL = environment.apiUrl + '/categories';

  private categories: Category[] = [
    { id: 'all', name: 'All Categories' },
    { id: 'handbags', name: 'Handbags', iconUrl: 'assets/icons/handbags.svg' },
    { id: 'shoes', name: 'Shoes', iconUrl: 'assets/icons/shoes.svg' },
    { id: 'clothing', name: 'Clothing', iconUrl: 'assets/icons/clothing.svg'}
  ];

  constructor(private http: HttpClient) {}

  getAllCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.API_URL)
      .pipe(catchError(this.handleError));
  }

  getCategoryById(id: string): Observable<Category> {
    return this.http.get<Category>(`${this.API_URL}/${id}`)
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