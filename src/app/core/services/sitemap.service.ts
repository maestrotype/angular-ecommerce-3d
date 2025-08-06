import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export interface SitemapUrl {
  url: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

@Injectable({
  providedIn: 'root'
})
export class SitemapService {
  private readonly baseUrl = environment.apiUrl;
  private readonly siteUrl = 'https://3dstore.com';

  constructor(private http: HttpClient) {}

  generateSitemap(): Observable<string> {
    return this.getSitemapUrls().pipe(
      map(urls => this.createSitemapXml(urls)),
      catchError(error => {
        console.error('Error generating sitemap:', error);
        return of(this.createBasicSitemapXml());
      })
    );
  }

  private getSitemapUrls(): Observable<SitemapUrl[]> {
    const staticUrls: SitemapUrl[] = [
      { url: '/', changefreq: 'daily', priority: 1.0 },
      { url: '/shop', changefreq: 'daily', priority: 0.9 },
      { url: '/about', changefreq: 'monthly', priority: 0.7 },
      { url: '/contacts', changefreq: 'monthly', priority: 0.7 },
      { url: '/favorites', changefreq: 'weekly', priority: 0.6 }
    ];

    // Get dynamic URLs from API
    return this.getDynamicUrls().pipe(
      map(dynamicUrls => [...staticUrls, ...dynamicUrls])
    );
  }

  private getDynamicUrls(): Observable<SitemapUrl[]> {
    const productUrls$ = this.http.get<any[]>(`${this.baseUrl}/products`).pipe(
      map(products => products.map(product => ({
        url: `/product/${product.id}`,
        lastmod: product.updatedAt || new Date().toISOString(),
        changefreq: 'weekly' as const,
        priority: 0.8
      }))),
      catchError(() => of([]))
    );

    const categoryUrls$ = this.http.get<any[]>(`${this.baseUrl}/categories`).pipe(
      map(categories => categories.map(category => ({
        url: `/category/${category.id}`,
        lastmod: category.updatedAt || new Date().toISOString(),
        changefreq: 'weekly' as const,
        priority: 0.7
      }))),
      catchError(() => of([]))
    );

    return productUrls$.pipe(
      map(productUrls => {
        // Combine with category URLs (simplified for now)
        return productUrls;
      })
    );
  }

  private createSitemapXml(urls: SitemapUrl[]): string {
    const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
    const urlsetHeader = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
    const urlsetFooter = '</urlset>';

    const urlEntries = urls.map(url => {
      const lastmod = url.lastmod ? `\n    <lastmod>${url.lastmod}</lastmod>` : '';
      const changefreq = url.changefreq ? `\n    <changefreq>${url.changefreq}</changefreq>` : '';
      const priority = url.priority ? `\n    <priority>${url.priority}</priority>` : '';

      return `  <url>
    <loc>${this.siteUrl}${url.url}</loc>${lastmod}${changefreq}${priority}
  </url>`;
    }).join('\n');

    return `${xmlHeader}
${urlsetHeader}
${urlEntries}
${urlsetFooter}`;
  }

  private createBasicSitemapXml(): string {
    const basicUrls: SitemapUrl[] = [
      { url: '/', changefreq: 'daily', priority: 1.0 },
      { url: '/shop', changefreq: 'daily', priority: 0.9 },
      { url: '/about', changefreq: 'monthly', priority: 0.7 },
      { url: '/contacts', changefreq: 'monthly', priority: 0.7 }
    ];

    return this.createSitemapXml(basicUrls);
  }

  // Generate robots.txt content
  generateRobotsTxt(): string {
    return `User-agent: *
Allow: /

# Sitemap
Sitemap: ${this.siteUrl}/sitemap.xml

# Disallow admin and API routes
Disallow: /admin/
Disallow: /api/

# Crawl delay
Crawl-delay: 1`;
  }

  // Save sitemap to file (for backend implementation)
  saveSitemapToFile(sitemapContent: string): Observable<boolean> {
    // This would typically be implemented on the backend
    // For now, we'll just return success
    return of(true);
  }
} 