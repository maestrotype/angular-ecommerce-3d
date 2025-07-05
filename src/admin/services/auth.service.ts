
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment.prod';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  expiresIn: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
//   private apiUrl = 'http://localhost:3002/api/auth';
  private apiUrl = environment.apiUrl + 'auth';

  constructor(private http: HttpClient) {
    this.checkExistingToken();
    (window as any).authService = this;
  }

  login(credentials: LoginCredentials): Observable<AuthResponse> {
     // Mock login for development - remove when backend is ready
     if (credentials.email === 'admin@example.com' && credentials.password === 'admin123') {
        const mockResponse: AuthResponse = {
          user: {
            id: '1',
            email: credentials.email,
            name: 'Admin User',
            role: 'admin'
          },
          token: 'mock-jwt-token-' + Date.now(),
          expiresIn: 3600
        };
        
        this.setSession(mockResponse);
        return of(mockResponse);
      }
      
      // Real API call - fallback to mock on error
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          this.setSession(response);
        }),
        catchError(error => {
          console.warn('API login failed, using mock auth:', error);
          // Fallback to mock login
          if (credentials.email === 'admin@example.com' && credentials.password === 'admin123') {
            const mockResponse: AuthResponse = {
              user: {
                id: '1',
                email: credentials.email,
                name: 'Admin User',
                role: 'admin'
              },
              token: 'mock-jwt-token-' + Date.now(),
              expiresIn: 3600
            };
            
            this.setSession(mockResponse);
            return of(mockResponse);
          }
          throw error;
        })
      );
  }

  quickLogin(): void {
    const mockResponse: AuthResponse = {
      user: {
        id: '1',
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'admin'
      },
      token: 'mock-jwt-token-' + Date.now(),
      expiresIn: 3600
    };
    
    this.setSession(mockResponse);
    console.log('Quick login completed', 'Token:', mockResponse.token);
  }

  logout(): void {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    localStorage.removeItem('token_expiry');
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('admin_token');
    const expiry = localStorage.getItem('token_expiry');
    
    if (!token || !expiry) {
      return false;
    }
    
    return new Date().getTime() < parseInt(expiry);
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'admin';
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    return localStorage.getItem('admin_token');
  }

  private setSession(authResult: AuthResponse): void {
    const expiresAt = new Date().getTime() + (authResult.expiresIn * 1000);
    
    localStorage.setItem('admin_token', authResult.token);
    localStorage.setItem('admin_user', JSON.stringify(authResult.user));
    localStorage.setItem('token_expiry', expiresAt.toString());
    
    this.currentUserSubject.next(authResult.user);
  }

  private checkExistingToken(): void {
    if (this.isAuthenticated()) {
      const userStr = localStorage.getItem('admin_user');
      if (userStr) {
        const user = JSON.parse(userStr) as User;
        this.currentUserSubject.next(user);
      }
    }
  }
}
