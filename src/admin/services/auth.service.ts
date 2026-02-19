import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { User, AuthResponse, LoginCredentials, RegisterCredentials } from '../../shared/models/user.model';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private apiUrl = environment.apiUrl + '/auth';

  constructor(private http: HttpClient) {
    this.checkExistingToken();
    (window as any).authService = this;
  }

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          this.setSession(response);
        }),
        catchError(error => {
          
          throw error;
        })
      );
  }

  register(name: string, email: string, password: string): Observable<AuthResponse> {
    const credentials: RegisterCredentials = { name, email, password };
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, credentials)
      .pipe(
        tap(response => {
          this.setSession(response);
        }),
        catchError(error => {
          
          throw error;
        })
      );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('token_expiry');
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
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
    return localStorage.getItem('token');
  }

  private setSession(authResult: AuthResponse): void {
    const expiresAt = new Date().getTime() + (authResult.expiresIn * 1000);
    localStorage.setItem('token', authResult.token);
    localStorage.setItem('user', JSON.stringify(authResult.user));
    localStorage.setItem('token_expiry', expiresAt.toString());
    this.currentUserSubject.next(authResult.user);
  }

  private checkExistingToken(): void {
    if (this.isAuthenticated()) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr) as User;
        this.currentUserSubject.next(user);
      }
    }
  }
}
