import { Controller, Get, HttpStatus, HttpCode } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { SettingsService } from './settings.service';

@Controller('public-settings')
export class PublicSettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('general')
  @HttpCode(HttpStatus.OK)
  getGeneralSettings(): Observable<any> {
    return this.settingsService.getSettingsByCategory('general').pipe(
      map((settings) => {
        const result: any = {};
        settings.forEach(s => {
          const key = s.key.split('.')[1] || s.key;
          result[key] = s.value;
        });
        return { success: true, data: result };
      }),
      catchError((error) => of({ success: false, error: error.message }))
    );
  }

  @Get('shop-catalog')
  @HttpCode(HttpStatus.OK)
  getShopCatalogSettings(): Observable<any> {
    return this.settingsService.getShopCatalogSettings().pipe(
      map((data) => ({ success: true, data })),
      catchError((error) => of({ success: false, error: error.message })),
    );
  }

  @Get('best-sellers-catalog')
  @HttpCode(HttpStatus.OK)
  getBestSellersCatalogSettings(): Observable<any> {
    return this.settingsService.getBestSellersCatalogSettings().pipe(
      map((data) => ({ success: true, data })),
      catchError((error) => of({ success: false, error: error.message })),
    );
  }
}
