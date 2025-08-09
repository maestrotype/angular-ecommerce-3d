import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { SeoService } from './seo.service';
import { environment } from '../../../environments/environment';

export interface FrontendSeoSettings {
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
  enableSitemap: boolean;
  enableStructuredData: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class FrontendSeoService {
  private readonly apiUrl = `${environment.apiUrl}/seo`;
  private settingsLoaded = false;

  constructor(
    private http: HttpClient,
    private seoService: SeoService
  ) {}

  loadAndApplySeoSettings(): Observable<FrontendSeoSettings | null> {
    if (this.settingsLoaded) {
      return of(null);
    }

    return this.http.get<{ success: boolean; data: FrontendSeoSettings }>(`${this.apiUrl}/settings`).pipe(
      map(response => {
        if (response.success && response.data) {
          this.applySeoSettings(response.data);
          this.settingsLoaded = true;
          return response.data;
        }
        return null;
      }),
      catchError(error => {
        console.error('Error loading SEO settings:', error);
        // Apply default settings if backend is not available
        this.applyDefaultSeoSettings();
        return of(null);
      })
    );
  }

  private applySeoSettings(settings: FrontendSeoSettings): void {
    // Apply basic SEO
    this.seoService.updateSeo({
      title: settings.siteName,
      description: settings.siteDescription,
      keywords: settings.siteKeywords,
      image: settings.defaultOgImage,
      url: settings.siteUrl,
      type: 'website'
    });

    // Apply Google Analytics if available
    if (settings.googleAnalyticsId) {
      this.loadGoogleAnalytics(settings.googleAnalyticsId);
    }

    // Apply Google Search Console if available
    if (settings.googleSearchConsole) {
      this.addGoogleSearchConsole(settings.googleSearchConsole);
    }

    // Apply Bing Webmaster Tools if available
    if (settings.bingWebmasterTools) {
      this.addBingWebmasterTools(settings.bingWebmasterTools);
    }

    // Apply structured data if enabled
    if (settings.enableStructuredData) {
      this.seoService.updateStructuredData(this.generateWebsiteStructuredData(settings));
    }
  }

  private applyDefaultSeoSettings(): void {
    this.seoService.updateHomeSeo();
  }

  private loadGoogleAnalytics(gaId: string): void {
    // Remove existing GA script
    const existingScript = document.querySelector('script[src*="googletagmanager.com"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Add Google Analytics script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    document.head.appendChild(script);

    // Initialize gtag
    const gtagScript = document.createElement('script');
    gtagScript.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${gaId}');
    `;
    document.head.appendChild(gtagScript);
  }

  private addGoogleSearchConsole(verificationCode: string): void {
    // Remove existing verification
    const existingMeta = document.querySelector('meta[name="google-site-verification"]');
    if (existingMeta) {
      existingMeta.remove();
    }

    // Add verification meta tag
    const meta = document.createElement('meta');
    meta.name = 'google-site-verification';
    meta.content = verificationCode;
    document.head.appendChild(meta);
  }

  private addBingWebmasterTools(verificationCode: string): void {
    // Remove existing verification
    const existingMeta = document.querySelector('meta[name="msvalidate.01"]');
    if (existingMeta) {
      existingMeta.remove();
    }

    // Add verification meta tag
    const meta = document.createElement('meta');
    meta.name = 'msvalidate.01';
    meta.content = verificationCode;
    document.head.appendChild(meta);
  }

  private generateWebsiteStructuredData(settings: FrontendSeoSettings): any {
    return {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": settings.siteName,
      "description": settings.siteDescription,
      "url": settings.siteUrl,
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${settings.siteUrl}/search?q={search_term_string}`
        },
        "query-input": "required name=search_term_string"
      }
    };
  }

  // Method to force reload settings (useful for testing)
  reloadSeoSettings(): Observable<FrontendSeoSettings | null> {
    this.settingsLoaded = false;
    return this.loadAndApplySeoSettings();
  }
} 