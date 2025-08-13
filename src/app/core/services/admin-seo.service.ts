import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment.prod';

export interface SeoSettings {
  id: number;
  siteName: string;
  siteDescription: string;
  siteKeywords: string;
  siteUrl: string;
  defaultLanguage: string;
  defaultOgImage?: string;
  ogSiteName?: string;
  twitterHandle?: string;
  googleAnalyticsId?: string;
  googleSearchConsole?: string;
  bingWebmasterTools?: string;
  robotsTxtContent?: string;
  enableSitemap: boolean;
  enableStructuredData: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateSeoSettingsDto {
  siteName: string;
  siteDescription: string;
  siteKeywords: string;
  siteUrl: string;
  defaultLanguage: string;
  defaultOgImage?: string;
  ogSiteName?: string;
  twitterHandle?: string;
  googleAnalyticsId?: string;
  googleSearchConsole?: string;
  bingWebmasterTools?: string;
  robotsTxtContent?: string;
  enableSitemap: boolean;
  enableStructuredData: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AdminSeoService {
  private readonly apiUrl = `${environment.apiUrl}/seo`;
  private seoSettings$ = new BehaviorSubject<SeoSettings | null>(null);

  constructor(private http: HttpClient) {}

  getSeoSettings(): Observable<SeoSettings> {
    return this.http.get<{ success: boolean; data: SeoSettings }>(`${this.apiUrl}/settings`).pipe(
      map(response => {
        if (response.success) {
          this.seoSettings$.next(response.data);
          return response.data;
        }
        throw new Error('Failed to get SEO settings');
      }),
      catchError(error => {
        console.error('Error getting SEO settings:', error);
        throw error;
      })
    );
  }

  updateSeoSettings(settings: UpdateSeoSettingsDto): Observable<SeoSettings> {
    return this.http.put<{ success: boolean; data: SeoSettings; message: string }>(`${this.apiUrl}/settings`, settings).pipe(
      map(response => {
        if (response.success) {
          this.seoSettings$.next(response.data);
          return response.data;
        }
        throw new Error('Failed to update SEO settings');
      }),
      catchError(error => {
        console.error('Error updating SEO settings:', error);
        throw error;
      })
    );
  }

  generateSitemap(): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; data: { success: boolean; message: string }; message: string }>(`${this.apiUrl}/generate-sitemap`, {}).pipe(
      map(response => {
        if (response.success) {
          return response.data;
        }
        throw new Error('Failed to generate sitemap');
      }),
      catchError(error => {
        console.error('Error generating sitemap:', error);
        throw error;
      })
    );
  }

  getRobotsTxt(): Observable<string> {
    return this.http.get<{ success: boolean; data: string }>(`${this.apiUrl}/robots-txt`).pipe(
      map(response => {
        if (response.success) {
          return response.data;
        }
        throw new Error('Failed to get robots.txt');
      }),
      catchError(error => {
        console.error('Error getting robots.txt:', error);
        throw error;
      })
    );
  }

  updateRobotsTxt(content: string): Observable<{ success: boolean }> {
    return this.http.put<{ success: boolean; data: { success: boolean }; message: string }>(`${this.apiUrl}/robots-txt`, { content }).pipe(
      map(response => {
        if (response.success) {
          return response.data;
        }
        throw new Error('Failed to update robots.txt');
      }),
      catchError(error => {
        console.error('Error updating robots.txt:', error);
        throw error;
      })
    );
  }

  getSeoSettingsObservable(): Observable<SeoSettings | null> {
    return this.seoSettings$.asObservable();
  }

  refreshSeoSettings(): void {
    this.getSeoSettings().subscribe();
  }
} 