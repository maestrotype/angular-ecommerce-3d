import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, CreateUserRequest, UpdateUserRequest } from '../../shared/models/user.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl || 'http://localhost:3002/api'}/users`;

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
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  createUser(userData: CreateUserRequest): Observable<User> {
    return this.http.post<User>(this.apiUrl, userData);
  }

  updateUser(userData: UpdateUserRequest): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${userData.id}`, userData);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  blockUser(id: number): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${id}/block`, {});
  }

  unblockUser(id: number): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${id}/unblock`, {});
  }

  changeUserRole(id: number, role: 'admin' | 'user'): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${id}/role`, { role });
  }
}