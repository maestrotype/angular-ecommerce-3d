import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { isLocalApiPreferred, resolveApiUrl } from '../utils/api-url.util';

@Injectable({ providedIn: 'root' })
export class ApiEnvironmentService {
  private readonly apiUrlSubject = new BehaviorSubject<string>(resolveApiUrl());
  readonly apiUrl$ = this.apiUrlSubject.asObservable();

  get apiUrl(): string {
    return resolveApiUrl();
  }

  get isLocalApi(): boolean {
    return this.apiUrl.includes('localhost:3002');
  }

  get isDevelopment(): boolean {
    return typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  }

  syncFromStorage(): void {
    this.apiUrlSubject.next(resolveApiUrl());
  }

  toggle(): boolean {
    const nextIsLocal = !this.isLocalApi;
    localStorage.setItem('use_local_api', nextIsLocal ? 'true' : 'false');
    this.apiUrlSubject.next(resolveApiUrl());
    return nextIsLocal;
  }

  initialize(): void {
    this.apiUrlSubject.next(resolveApiUrl());
  }

  shouldUseLocalBackend(): boolean {
    return isLocalApiPreferred();
  }
}
