import { Controller, Get, Put, Post, Body, Param, HttpStatus, HttpCode, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

import { Observable, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { SettingsService } from './settings.service';
import { 
  UpdateSettingsDto, 
  UpdatePaymentSettingsDto, 
  UpdateGeneralSettingsDto,
  UpdateSecuritySettingsDto,
  UpdateNotificationSettingsDto,
  UpdateCloudinarySettingsDto,
  UpdateAiSettingsDto,
  UpdateSMTPSettingsDto,
  UpdateShopCatalogSettingsDto
} from './dto/update-settings.dto';

@Controller('settings')
@UseGuards(JwtAuthGuard, AdminGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  // Get all settings grouped by category
  @Get()
  @HttpCode(HttpStatus.OK)
  getAllSettings(): Observable<any> {
    return this.settingsService.getSettingsGrouped().pipe(
      map((settings) => ({ success: true, data: settings })),
      catchError((error) => of({ success: false, error: error.message }))
    );
  }

  // Get raw grouped settings (internal/full)
  @Get('raw')
  @HttpCode(HttpStatus.OK)
  getRawSettings(): Observable<any> {
    return this.settingsService.getSettingsGrouped().pipe(
      map((settings) => ({ success: true, data: settings })),
      catchError((error) => of({ success: false, error: error.message }))
    );
  }

  @Get('cloudinary/status')
  @HttpCode(HttpStatus.OK)
  getCloudinaryStatus(): Observable<any> {
    return this.settingsService.getCloudinaryStatus().pipe(
      map((status) => ({ success: true, data: status })),
      catchError((error) => of({ success: false, error: error.message }))
    );
  }

  // Get settings by category
  @Get(':category')
  @HttpCode(HttpStatus.OK)
  getSettingsByCategory(@Param('category') category: string): Observable<any> {
    return this.settingsService.getSettingsByCategory(category).pipe(
      map((settings) => ({ success: true, data: settings })),
      catchError((error) => of({ success: false, error: error.message }))
    );
  }

  // Get single setting by key
  @Get('key/:key')
  @HttpCode(HttpStatus.OK)
  getSettingByKey(@Param('key') key: string): Observable<any> {
    return this.settingsService.getSettingByKey(key).pipe(
      map((setting) => ({ success: true, data: setting })),
      catchError((error) => of({ success: false, error: error.message }))
    );
  }

  // Update single setting
  @Put('key')
  @HttpCode(HttpStatus.OK)
  updateSetting(@Body() updateSettingsDto: UpdateSettingsDto): Observable<any> {
    return this.settingsService.updateSetting(updateSettingsDto).pipe(
      map((setting) => ({ success: true, data: setting, message: 'Setting updated successfully' })),
      catchError((error) => of({ success: false, error: error.message }))
    );
  }

  // Update payment settings
  @Put('payment')
  @HttpCode(HttpStatus.OK)
  updatePaymentSettings(@Body() settings: UpdatePaymentSettingsDto): Observable<any> {
    return this.settingsService.updatePaymentSettings(settings).pipe(
      map((result) => ({ success: true, data: result, message: 'Payment settings updated successfully' })),
      catchError((error) => of({ success: false, error: error.message }))
    );
  }

  // Update general settings
  @Put('general')
  @HttpCode(HttpStatus.OK)
  updateGeneralSettings(@Body() settings: UpdateGeneralSettingsDto): Observable<any> {
    return this.settingsService.updateGeneralSettings(settings).pipe(
      map((result) => ({ success: true, data: result, message: 'General settings updated successfully' })),
      catchError((error) => of({ success: false, error: error.message }))
    );
  }

  // Update security settings
  @Put('security')
  @HttpCode(HttpStatus.OK)
  updateSecuritySettings(@Body() settings: UpdateSecuritySettingsDto): Observable<any> {
    return this.settingsService.updateSecuritySettings(settings).pipe(
      map((result) => ({ success: true, data: result, message: 'Security settings updated successfully' })),
      catchError((error) => of({ success: false, error: error.message }))
    );
  }

  // Update notification settings
  @Put('notifications')
  @HttpCode(HttpStatus.OK)
  updateNotificationSettings(@Body() settings: UpdateNotificationSettingsDto): Observable<any> {
    return this.settingsService.updateNotificationSettings(settings).pipe(
      map((result) => ({ success: true, data: result, message: 'Notification settings updated successfully' })),
      catchError((error) => of({ success: false, error: error.message }))
    );
  }

  // Update Cloudinary settings
  @Put('cloudinary')
  @HttpCode(HttpStatus.OK)
  updateCloudinarySettings(@Body() settings: UpdateCloudinarySettingsDto): Observable<any> {
    return this.settingsService.updateCloudinarySettings(settings).pipe(
      switchMap((result) =>
        this.settingsService.getCloudinaryStatus().pipe(
          map((status) => ({
            success: true,
            data: result,
            cloudinaryStatus: status,
            message: 'Cloudinary settings updated successfully',
          })),
        ),
      ),
      catchError((error) => of({ success: false, error: error.message }))
    );
  }

  // Update AI Engine settings
  @Put('ai')
  @HttpCode(HttpStatus.OK)
  updateAiSettings(@Body() settings: UpdateAiSettingsDto): Observable<any> {
    return this.settingsService.updateAiSettings(settings).pipe(
      map((result) => ({ success: true, data: result, message: 'AI Engine settings updated successfully' })),
      catchError((error) => of({ success: false, error: error.message }))
    );
  }

  // Get shop catalog display settings
  @Get('shop-catalog')
  @HttpCode(HttpStatus.OK)
  getShopCatalogSettings(): Observable<any> {
    return this.settingsService.getShopCatalogSettings().pipe(
      map((data) => ({ success: true, data })),
      catchError((error) => of({ success: false, error: error.message })),
    );
  }

  // Update shop catalog display settings
  @Put('shop-catalog')
  @HttpCode(HttpStatus.OK)
  updateShopCatalogSettings(@Body() settings: UpdateShopCatalogSettingsDto): Observable<any> {
    return this.settingsService.updateShopCatalogSettings(settings).pipe(
      map((result) => ({ success: true, data: result, message: 'Shop catalog settings updated successfully' })),
      catchError((error) => of({ success: false, error: error.message })),
    );
  }

  // Get best sellers catalog display settings
  @Get('best-sellers-catalog')
  @HttpCode(HttpStatus.OK)
  getBestSellersCatalogSettings(): Observable<any> {
    return this.settingsService.getBestSellersCatalogSettings().pipe(
      map((data) => ({ success: true, data })),
      catchError((error) => of({ success: false, error: error.message })),
    );
  }

  // Update best sellers catalog display settings
  @Put('best-sellers-catalog')
  @HttpCode(HttpStatus.OK)
  updateBestSellersCatalogSettings(@Body() settings: UpdateShopCatalogSettingsDto): Observable<any> {
    return this.settingsService.updateBestSellersCatalogSettings(settings).pipe(
      map((result) => ({ success: true, data: result, message: 'Best sellers catalog settings updated successfully' })),
      catchError((error) => of({ success: false, error: error.message })),
    );
  }

  // Update SMTP settings
  @Put('smtp')
  @HttpCode(HttpStatus.OK)
  updateSMTPSettings(@Body() settings: UpdateSMTPSettingsDto): Observable<any> {
    return this.settingsService.updateSMTPSettings(settings).pipe(
      map((result) => ({ success: true, data: result, message: 'SMTP settings updated successfully' })),
      catchError((error) => of({ success: false, error: error.message }))
    );
  }

  // Initialize default settings (for first run)
  @Post('init')
  @HttpCode(HttpStatus.CREATED)
  initializeDefaultSettings(): Observable<any> {
    return of(this.settingsService.initializeDefaultSettings()).pipe(
      map(() => ({ success: true, message: 'Default settings initialized successfully' })),
      catchError((error) => of({ success: false, error: error.message }))
    );
  }
}
