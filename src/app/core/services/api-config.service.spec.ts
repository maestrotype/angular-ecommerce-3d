import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PLATFORM_ID } from '@angular/core';
import { ApiConfigService } from './api-config.service';
import { environment } from '../../../environments/environment';

describe('ApiConfigService', () => {
    let service: ApiConfigService;
    let httpMock: HttpTestingController;

    const mockEnvironment = {
        production: false,
        apiUrl: 'http://localhost:3002/api',
        fallbackApiUrl: 'https://production-api.com/api'
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                ApiConfigService,
                { provide: PLATFORM_ID, useValue: 'browser' }
            ]
        });

        service = TestBed.inject(ApiConfigService);
        httpMock = TestBed.inject(HttpTestingController);

        // Initial state
        environment.apiUrl = mockEnvironment.apiUrl;
        (environment as any).fallbackApiUrl = mockEnvironment.fallbackApiUrl;
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should switch to fallback API when local backend is unreachable', async () => {
        // Mock localhost
        Object.defineProperty(window, 'location', {
            value: { hostname: 'localhost' },
            writable: true
        });

        const initPromise = service.init();

        // Mock first health check failing
        const req = httpMock.expectOne(`${mockEnvironment.apiUrl}/health`);
        req.error(new ProgressEvent('error'));

        // Mock second check (products) failing
        const req2 = httpMock.expectOne(`${mockEnvironment.apiUrl}/products`);
        req2.error(new ProgressEvent('error'));

        await initPromise;

        expect(environment.apiUrl).toBe(mockEnvironment.fallbackApiUrl);
    });

    it('should keep local API when backend is active', async () => {
        Object.defineProperty(window, 'location', {
            value: { hostname: 'localhost' },
            writable: true
        });

        const initPromise = service.init();

        const req = httpMock.expectOne(`${mockEnvironment.apiUrl}/health`);
        req.flush({}, { status: 200, statusText: 'OK' });

        await initPromise;

        expect(environment.apiUrl).toBe(mockEnvironment.apiUrl);
    });
});
