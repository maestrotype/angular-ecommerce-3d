import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      if (token) {
        console.log('AuthInterceptor: Attaching token to', request.url);
        request = request.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
      } else {
        console.warn('AuthInterceptor: No token found in localStorage');
      }
    }
    return next.handle(request);
  }
}