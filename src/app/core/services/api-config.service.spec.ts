import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PLATFORM_ID } from '@angular/core';
import { ApiConfigService } from './api-config.service';
import { ApiEnvironmentService } from './api-environment.service';
import { LOCAL_API_URL } from '../utils/api-url.util';

describe('ApiConfigService', () => {
    let service: ApiConfigService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        localStorage.setItem('use_local_api', 'true');
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                ApiConfigService,
                ApiEnvironmentService,
                { provide: PLATFORM_ID, useValue: 'browser' }
            ]
        });

        service = TestBed.inject(ApiConfigService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
        localStorage.removeItem('use_local_api');
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should keep local API preference when backend is active', async () => {
        Object.defineProperty(window, 'location', {
            value: { hostname: 'localhost' },
            writable: true
        });

        const initPromise = service.init();
        const req = httpMock.expectOne(`${LOCAL_API_URL}/health`);
        req.flush({}, { status: 200, statusText: 'OK' });
        await initPromise;

        expect(localStorage.getItem('use_local_api')).toBe('true');
    });

    it('should not switch to production when local backend is unreachable', async () => {
        Object.defineProperty(window, 'location', {
            value: { hostname: 'localhost' },
            writable: true
        });

        const initPromise = service.init();
        const req = httpMock.expectOne(`${LOCAL_API_URL}/health`);
        req.error(new ProgressEvent('error'));
        await initPromise;

        expect(localStorage.getItem('use_local_api')).toBe('true');
    });
});
