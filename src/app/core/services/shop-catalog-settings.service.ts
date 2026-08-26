import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  DEFAULT_SHOP_CATALOG_SETTINGS,
  normalizeShopCatalogSettings,
  ShopCatalogDisplaySettings,
} from '../../../shared/utils/shop-catalog.util';

@Injectable({
  providedIn: 'root',
})
export class ShopCatalogSettingsService {
  constructor(private http: HttpClient) {}

  getSettings(): Observable<ShopCatalogDisplaySettings> {
    return this.http
      .get<{ success: boolean; data?: Partial<ShopCatalogDisplaySettings> }>(
        `${environment.apiUrl}/public-settings/shop-catalog`,
      )
      .pipe(
        map((response) =>
          response.success && response.data
            ? normalizeShopCatalogSettings(response.data)
            : DEFAULT_SHOP_CATALOG_SETTINGS,
        ),
        catchError(() => of(DEFAULT_SHOP_CATALOG_SETTINGS)),
      );
  }
}
