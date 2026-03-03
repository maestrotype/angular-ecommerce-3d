import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse } from 'src/shared/models/auth-response.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.apiUrl + '/auth';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password });
  }

  register(name: string, email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, { name, email, password });
  }

  socialLogin(provider: string, idToken: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/social-login`, { provider, idToken });
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  saveAuthData(token: string, user: any) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    }
  }

  isAuthenticated(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return !!localStorage.getItem('token') || !!localStorage.getItem('adminToken');
    }
    return false;
  }

  isAdmin(): boolean {
    const user = this.getUser();
    return user && user.role === 'admin';
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('token') || localStorage.getItem('adminToken');
    }
    return null;
  }

  getUser(): any {
    if (isPlatformBrowser(this.platformId)) {
      const user = localStorage.getItem('user');
      if (user) return JSON.parse(user);

      const adminUser = localStorage.getItem('adminUser');
      if (adminUser) return JSON.parse(adminUser);
    }
    return null;
  }
}