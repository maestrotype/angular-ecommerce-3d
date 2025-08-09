import { Controller, Get, Put, Post, Body, UsePipes, ValidationPipe } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { SeoService } from './seo.service';
import { UpdateSeoSettingsDto, SeoSettingsResponseDto } from './dto/seo-settings.dto';
import { ApiResponse } from '../shared/models/api-response.model';

@Controller('seo')
@UsePipes(new ValidationPipe({ transform: true }))
export class SeoController {
  constructor(private readonly seoService: SeoService) {}

  @Get('settings')
  getSeoSettings(): Observable<ApiResponse<SeoSettingsResponseDto>> {
    return this.seoService.getSeoSettings().pipe(
      map(settings => ({
        success: true,
        data: settings
      })),
      catchError(error => of({
        success: false,
        error: 'Failed to get SEO settings'
      }))
    );
  }

  @Put('settings')
  updateSeoSettings(@Body() updateDto: UpdateSeoSettingsDto): Observable<ApiResponse<SeoSettingsResponseDto>> {
    return this.seoService.updateSeoSettings(updateDto).pipe(
      map(settings => ({
        success: true,
        data: settings,
        message: 'SEO settings updated successfully'
      })),
      catchError(error => of({
        success: false,
        error: 'Failed to update SEO settings'
      }))
    );
  }

  @Post('generate-sitemap')
  generateSitemap(): Observable<ApiResponse<{ success: boolean; message: string }>> {
    return this.seoService.generateSitemap().pipe(
      map(result => ({
        success: true,
        data: result,
        message: result.message
      })),
      catchError(error => of({
        success: false,
        error: 'Failed to generate sitemap'
      }))
    );
  }

  @Get('robots-txt')
  getRobotsTxt(): Observable<ApiResponse<string>> {
    return this.seoService.getRobotsTxt().pipe(
      map(content => ({
        success: true,
        data: content
      })),
      catchError(error => of({
        success: false,
        error: 'Failed to get robots.txt content'
      }))
    );
  }

  @Put('robots-txt')
  updateRobotsTxt(@Body() body: { content: string }): Observable<ApiResponse<{ success: boolean }>> {
    return this.seoService.updateRobotsTxt(body.content).pipe(
      map(result => ({
        success: true,
        data: result,
        message: 'Robots.txt updated successfully'
      })),
      catchError(error => of({
        success: false,
        error: 'Failed to update robots.txt'
      }))
    );
  }
} 