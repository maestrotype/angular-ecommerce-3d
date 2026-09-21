import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, timeout } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { STOREFRONT_DEMO_DELAY_MS } from '../../../shared/utils/storefront-catalog-stream.util';
import {
  CatalogDisplaySettings,
  DEFAULT_CATALOG_DISPLAY_SETTINGS,
  normalizeCatalogDisplaySettings,
} from '../../../shared/utils/shop-catalog.util';

@Injectable({
  providedIn: 'root',
})
export class BestSellersCatalogSettingsService {
  constructor(private http: HttpClient) {}

  getSettings(): Observable<CatalogDisplaySettings> {
    return this.http
      .get<{ success: boolean; data?: Partial<CatalogDisplaySettings> }>(
        `${environment.apiUrl}/public-settings/best-sellers-catalog`,
      )
      .pipe(
        timeout(STOREFRONT_DEMO_DELAY_MS),
        map((response) =>
          response.success && response.data
            ? normalizeCatalogDisplaySettings(response.data)
            : DEFAULT_CATALOG_DISPLAY_SETTINGS,
        ),
        catchError(() => of(DEFAULT_CATALOG_DISPLAY_SETTINGS)),
      );
  }
}
