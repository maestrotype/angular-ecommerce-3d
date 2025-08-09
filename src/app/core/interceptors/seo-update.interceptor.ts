import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpEventType } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { FrontendSeoService } from '../services/frontend-seo.service';

@Injectable()
export class SeoUpdateInterceptor implements HttpInterceptor {
  constructor(private frontendSeoService: FrontendSeoService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      tap((event) => {
        // Check if this is a successful PUT request to SEO settings
        if (event.type === HttpEventType.Response && 
            request.method === 'PUT' && 
            request.url.includes('/seo/settings') &&
            event.status === 200) {
          
          // Reload SEO settings after successful update
          this.frontendSeoService.reloadSeoSettings().subscribe();
        }
      })
    );
  }
} 