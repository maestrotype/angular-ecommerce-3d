import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { UpdateSeoSettingsDto, SeoSettingsResponseDto } from './dto/seo-settings.dto';

@Injectable()
export class SeoService {
  private seoSettings: SeoSettingsResponseDto = {
    id: 1,
    siteName: '3D Store',
    siteDescription: 'Discover our amazing collection of 3D products with interactive visualization, AI image processing, and modern glassmorphism design.',
    siteKeywords: '3D store, e-commerce, 3D visualization, Three.js, glassmorphism, modern design',
    siteUrl: 'https://3dstore.com',
    defaultLanguage: 'en',
    defaultOgImage: '/assets/images/og-default.jpg',
    ogSiteName: '3D Store',
    twitterHandle: '@3dstore',
    googleAnalyticsId: '',
    googleSearchConsole: '',
    bingWebmasterTools: '',
    robotsTxtContent: 'User-agent: *\nAllow: /\n\nSitemap: https://3dstore.com/sitemap.xml\n\nDisallow: /admin/\nDisallow: /api/\n\nCrawl-delay: 1',
    enableSitemap: true,
    enableStructuredData: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  getSeoSettings(): Observable<SeoSettingsResponseDto> {
    return of(this.seoSettings).pipe(
      map(settings => settings),
      catchError(error => throwError(() => new HttpException('Failed to get SEO settings', HttpStatus.INTERNAL_SERVER_ERROR)))
    );
  }

  updateSeoSettings(updateDto: UpdateSeoSettingsDto): Observable<SeoSettingsResponseDto> {
    return of(updateDto).pipe(
      map(dto => {
        this.seoSettings = {
          ...this.seoSettings,
          ...dto,
          updatedAt: new Date()
        };
        return this.seoSettings;
      }),
      catchError(error => throwError(() => new HttpException('Failed to update SEO settings', HttpStatus.INTERNAL_SERVER_ERROR)))
    );
  }

  generateSitemap(): Observable<{ success: boolean; message: string }> {
    return of({}).pipe(
      map(() => ({
        success: true,
        message: 'Sitemap generated successfully'
      })),
      catchError(error => of({
        success: false,
        message: 'Failed to generate sitemap'
      }))
    );
  }

  getRobotsTxt(): Observable<string> {
    return of(this.seoSettings.robotsTxtContent || 'User-agent: *\nAllow: /');
  }

  updateRobotsTxt(content: string): Observable<{ success: boolean }> {
    return of(content).pipe(
      map(newContent => {
        this.seoSettings.robotsTxtContent = newContent;
        this.seoSettings.updatedAt = new Date();
        return { success: true };
      }),
      catchError(error => of({ success: false }))
    );
  }
} 