import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { firstValueFrom, timeout, catchError, of } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ApiConfigService {
    constructor(
        private http: HttpClient,
        @Inject(PLATFORM_ID) private platformId: Object
    ) { }

    async init(): Promise<void> {
        // Only perform this check in the browser and on localhost
        if (isPlatformBrowser(this.platformId)) {
            const hostname = window.location.hostname;

            if (hostname === 'localhost' || hostname === '127.0.0.1') {
                // Check local backend availability

                try {
                    // Try to ping the local health check or just a simple GET
                    // Using timeout to avoid long waits
                    await firstValueFrom(
                        this.http.get(`${environment.apiUrl}/health`, { observe: 'response' }).pipe(
                            timeout(1000),
                            catchError(() => {
                                // If health check doesn't exist, try products (common endpoint)
                                return this.http.get(`${environment.apiUrl}/products`, { observe: 'response' }).pipe(timeout(1000));
                            }),
                            catchError(() => {
                                throw new Error('Local backend unreachable');
                            })
                        )
                    );
                    // console.log('Local backend is active. Using:', environment.apiUrl);
                } catch (error) {
                    // console.warn('Local backend unreachable. Switching to fallback API:', (environment as any).fallbackApiUrl);
                    if ((environment as any).fallbackApiUrl) {
                        (environment as any).apiUrl = (environment as any).fallbackApiUrl;
                    }
                }
            }
        }
    }
}
