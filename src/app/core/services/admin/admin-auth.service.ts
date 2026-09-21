import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import {
  User,
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
} from '../../../../shared/models/user.model';
import { environment } from '../../../../environments/environment';

const DEFAULT_EXPIRES_IN_SEC = 604800;

@Injectable({
  providedIn: 'root',
})
export class AdminAuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private apiUrl = environment.apiUrl + '/auth';

  constructor(private http: HttpClient) {
    this.checkExistingToken();
  }

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http.post<unknown>(`${this.apiUrl}/login`, credentials).pipe(
      map((response) => this.normalizeAuthResponse(response)),
      tap((auth) => this.setSession(auth))
    );
  }

  register(
    name: string,
    email: string,
    password: string
  ): Observable<AuthResponse> {
    const credentials: RegisterCredentials = { name, email, password };
    return this.http.post<unknown>(`${this.apiUrl}/register`, credentials).pipe(
      map((response) => this.normalizeAuthResponse(response)),
      tap((auth) => this.setSession(auth))
    );
  }

  logout(): void {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminTokenExpiry');
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token || token === 'undefined' || token === 'null') {
      return false;
    }

    const expiry = localStorage.getItem('adminTokenExpiry');
    const expiryMs = expiry ? parseInt(expiry, 10) : NaN;
    if (!Number.isNaN(expiryMs)) {
      return Date.now() < expiryMs;
    }

    const jwtExp = this.decodeToken(token)?.exp;
    if (typeof jwtExp === 'number') {
      return Date.now() < jwtExp * 1000;
    }

    return true;
  }

  isAdmin(): boolean {
    const role = (
      this.getCurrentUser()?.role ||
      this.decodeToken(this.getToken())?.role ||
      ''
    )
      .toString()
      .toLowerCase();
    return role === 'admin' || role === 'administrator';
  }

  getCurrentUser(): User | null {
    if (this.currentUserSubject.value) {
      return this.currentUserSubject.value;
    }

    const userStr = localStorage.getItem('adminUser');
    if (!userStr || userStr === 'undefined') {
      return null;
    }

    try {
      return JSON.parse(userStr) as User;
    } catch {
      return null;
    }
  }

  getToken(): string | null {
    return localStorage.getItem('adminToken');
  }

  private setSession(authResult: AuthResponse): void {
    const expiresIn = Number(authResult.expiresIn);
    const ttlSec =
      Number.isFinite(expiresIn) && expiresIn > 0
        ? expiresIn
        : DEFAULT_EXPIRES_IN_SEC;
    const expiresAt = Date.now() + ttlSec * 1000;

    localStorage.setItem('adminToken', authResult.token);
    localStorage.setItem('adminUser', JSON.stringify(authResult.user));
    localStorage.setItem('adminTokenExpiry', String(expiresAt));
    this.currentUserSubject.next(authResult.user);
  }

  private checkExistingToken(): void {
    if (!this.isAuthenticated()) {
      return;
    }
    const user = this.getCurrentUser();
    if (user) {
      this.currentUserSubject.next(user);
    }
  }

  private normalizeAuthResponse(raw: unknown): AuthResponse {
    const root =
      raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
    const nested =
      root['data'] && typeof root['data'] === 'object'
        ? (root['data'] as Record<string, unknown>)
        : root;

    const token = String(nested['token'] || nested['access_token'] || '');
    const user = (nested['user'] || null) as User | null;
    const expiresIn = Number(
      nested['expiresIn'] ?? nested['expires_in'] ?? DEFAULT_EXPIRES_IN_SEC
    );

    if (!token) {
      throw new Error('Login response is missing a token');
    }

    return {
      token,
      user: user || this.userFromToken(token),
      expiresIn:
        Number.isFinite(expiresIn) && expiresIn > 0
          ? expiresIn
          : DEFAULT_EXPIRES_IN_SEC,
    };
  }

  private userFromToken(token: string): User {
    const payload = this.decodeToken(token) || {};
    return {
      id: Number(payload.sub) || 0,
      email: String(payload.email || ''),
      name: String(payload.name || payload.email || ''),
      role: payload.role === 'admin' ? 'admin' : 'user',
      status: 'active',
    };
  }

  private decodeToken(token: string | null): Record<string, unknown> | null {
    if (!token || token.split('.').length < 2) {
      return null;
    }
    try {
      const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(atob(payload)) as Record<string, unknown>;
    } catch {
      return null;
    }
  }
}
