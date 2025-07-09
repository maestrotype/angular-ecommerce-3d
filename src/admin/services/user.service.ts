import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { User, UserResponse, CreateUserRequest, UpdateUserRequest } from '../../shared/models/user.model';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.apiUrl + '/users';

  constructor(private http: HttpClient) {}

  getUsers(page: number = 1, limit: number = 10, search?: string): Observable<{users: User[], total: number}> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    
    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<{users: User[], total: number}>(this.apiUrl, { params });
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`).pipe(
      catchError(error => {
        console.error('Failed to fetch user:', error);
        throw error;
      })
    );
  }

  createUser(userData: Partial<User>): Observable<User> {
    return this.http.post<User>(this.apiUrl, userData).pipe(
      catchError(error => {
        console.error('Failed to create user:', error);
        throw error;
      })
    );
  }

  updateUser(id: number, userData: Partial<User>): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${id}`, userData).pipe(
      catchError(error => {
        console.error('Failed to update user:', error);
        throw error;
      })
    );
  }

  blockUser(id: number): Observable<User> {
    return this.updateUser(id, { status: 'inactive' });
  }
  
  unblockUser(id: number): Observable<User> {
    return this.updateUser(id, { status: 'active' });
  }

  changeUserRole(id: number, role: 'admin' | 'user'): Observable<User> {
    return this.updateUser(id, { role });
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
    catchError(error => {
      console.error('Failed to delete user:', error);
      throw error;
    }))}
}