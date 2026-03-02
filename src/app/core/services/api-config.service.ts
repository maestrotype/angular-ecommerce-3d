import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { firstValueFrom, timeout, catchError } from 'rxjs';

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
                try {
                    // Try health endpoint with 5s timeout (was 1s - too short for cold start)
                    await firstValueFrom(
                        this.http.get(`${environment.apiUrl}/health`, { observe: 'response' }).pipe(
                            timeout(5000),
                            catchError(() => {
                                throw new Error('Local backend unreachable');
                            })
                        )
                    );
                    console.log('[ApiConfig] Local backend is active:', environment.apiUrl);
                } catch (error) {
                    // DO NOT switch to fallback in development - this causes auth issues
                    // because local JWT tokens are not valid on production backend
                    console.warn('[ApiConfig] Local backend health check failed. Keeping local URL:', environment.apiUrl);
                    console.warn('[ApiConfig] Make sure backend is running on port 3002: cd backend && npm run start:dev');
                }
            }
        }
    }
}
