import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
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
        map((response) =>
          response.success && response.data
            ? normalizeCatalogDisplaySettings(response.data)
            : DEFAULT_CATALOG_DISPLAY_SETTINGS,
        ),
        catchError(() => of(DEFAULT_CATALOG_DISPLAY_SETTINGS)),
      );
  }
}
