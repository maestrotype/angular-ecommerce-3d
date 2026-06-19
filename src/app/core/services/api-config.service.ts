import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, timeout, catchError } from 'rxjs';
import { ApiEnvironmentService } from './api-environment.service';
import { LOCAL_API_URL } from '../utils/api-url.util';

@Injectable({
    providedIn: 'root'
})
export class ApiConfigService {
    constructor(
        private http: HttpClient,
        private apiEnvironment: ApiEnvironmentService,
        @Inject(PLATFORM_ID) private platformId: Object
    ) { }

    async init(): Promise<void> {
        this.apiEnvironment.initialize();

        if (!isPlatformBrowser(this.platformId) || !this.apiEnvironment.isDevelopment) {
            return;
        }

        // Respect explicit LOCAL preference — do not auto-switch to production.
        if (this.apiEnvironment.shouldUseLocalBackend()) {
            try {
                await firstValueFrom(
                    this.http.get(`${LOCAL_API_URL}/health`, { observe: 'response' }).pipe(
                        timeout(1500),
                        catchError(() => {
                            throw new Error('Local backend unreachable');
                        })
                    )
                );
            } catch {
                console.warn('[ApiConfig] Local backend is not running. Start it with: cd backend && npm run start:dev');
            }
        }
    }
}
