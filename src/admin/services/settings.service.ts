import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, of, throwError, timer } from "rxjs";
import { map, catchError, retry, switchMap } from "rxjs/operators";
import { environment } from '../../environments/environment';
import { PROD_API_URL } from '../../app/core/utils/api-url.util';
import { ApiResponse } from 'src/shared/models/api-response.model';

export interface GeneralSettings {
  siteName: string;
  siteDescription: string;
  currency: string;
  timezone: string;
  language: string;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  orderNotifications: boolean;
  stockAlerts: boolean;
  userRegistrations: boolean;
  systemUpdates: boolean;
}

export interface SecuritySettings {
  twoFactorAuth: boolean;
  sessionTimeout: number;
  passwordExpiry: number;
  maxLoginAttempts: number;
}

export interface PaymentSettings {
  stripeEnabled: boolean;
  stripeTestMode: boolean;
  stripePublishableKey: string;
  stripeSecretKey: string;
  stripeWebhookSecret: string;
  liqpayEnabled: boolean;
  liqpayTestMode: boolean;
  liqpayPublicKey: string;
  liqpayPrivateKey: string;
  paypalEnabled: boolean;
  paypalTestMode: boolean;
  paypalClientId: string;
  paypalClientSecret: string;
  defaultPaymentMethod: string;
}

export interface CloudinarySettings {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}

export interface CloudinaryStatus {
  configured: boolean;
  source: 'database' | 'environment' | 'none';
  cloudName: string | null;
  apiKeySet: boolean;
  apiSecretSet: boolean;
  connectionOk: boolean | null;
  connectionError: string | null;
  uploadReady: boolean;
  messageKey: string;
  messageParams?: Record<string, string>;
}

export interface AiGenerationSettings {
  activeProvider: string;
  tripoApiKey: string;
  meshyApiKey: string;
  hunyuanApiKey: string;
  lumaApiKey: string;
  hfToken: string;
  hfSpace: string;
  customUrl: string;
  customUseHq: boolean;
}

export interface SMTPSettings {
  host: string;
  port: number;
  user: string;
  pass: string;
  fromEmail: string;
}

export interface AppSettings {
  general?: GeneralSettings;
  notifications?: NotificationSettings;
  security?: SecuritySettings;
  payment?: PaymentSettings;
  cloudinary?: CloudinarySettings;
  ai?: AiGenerationSettings;
  smtp?: SMTPSettings;
}

@Injectable({
  providedIn: "root",
})
export class SettingsService {
  private get apiUrl(): string {
    return environment.apiUrl + "/settings";
  }

  constructor(private http: HttpClient) {}

  getSettings(): Observable<AppSettings> {
    return this.http.get<{ success: boolean; data: AppSettings }>(this.apiUrl).pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data;
        }
        // Fallback to mock settings if backend fails
        return this.getMockSettings();
      }),
      catchError(error => {
        
        // Return mock settings as fallback
        return of(this.getMockSettings());
      })
    );
  }

  // Local storage methods removed - now using backend API

  private getMockSettings(): AppSettings {
    return {
      general: {
        siteName: "E-Commerce Admin",
        siteDescription: "Admin panel for e-commerce management",
        currency: "USD",
        timezone: "UTC",
        language: "en",
      },
      notifications: {
        emailNotifications: true,
        orderNotifications: true,
        stockAlerts: true,
        userRegistrations: true,
        systemUpdates: false,
      },
      security: {
        twoFactorAuth: false,
        sessionTimeout: 30,
        passwordExpiry: 90,
        maxLoginAttempts: 5,
      },
      payment: {
        stripeEnabled: false,
        stripeTestMode: true,
        stripePublishableKey: '',
        stripeSecretKey: '',
        stripeWebhookSecret: '',
        liqpayEnabled: false,
        liqpayTestMode: true,
        liqpayPublicKey: '',
        liqpayPrivateKey: '',
        paypalEnabled: false,
        paypalTestMode: true,
        paypalClientId: '',
        paypalClientSecret: '',
        defaultPaymentMethod: 'stripe'
      },
      cloudinary: {
        cloudName: '',
        apiKey: '',
        apiSecret: ''
      },
      ai: {
        activeProvider: 'tripo3d',
        tripoApiKey: '',
        meshyApiKey: '',
        hunyuanApiKey: '',
        lumaApiKey: '',
        hfToken: '',
        hfSpace: 'stabilityai/TripoSR',
        customUrl: '',
        customUseHq: false
      },
      smtp: {
        host: '',
        port: 587,
        user: '',
        pass: '',
        fromEmail: ''
      }
    };
  }

  updateGeneralSettings(settings: GeneralSettings): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.apiUrl}/general`, settings).pipe(
      map(response => response),
      catchError(error => {
        throw error;
      })
    );
  }

  updateNotificationSettings(settings: NotificationSettings): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.apiUrl}/notifications`, settings).pipe(
      map(response => response),
      catchError(error => {
        throw error;
      })
    );
  }

  updateSecuritySettings(settings: SecuritySettings): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.apiUrl}/security`, settings).pipe(
      map(response => response),
      catchError(error => {
        throw error;
      })
    );
  }

  updatePaymentSettings(settings: PaymentSettings): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.apiUrl}/payment`, settings).pipe(
      map(response => response),
      catchError(error => {
        throw error;
      })
    );
  }

  updateCloudinarySettings(settings: CloudinarySettings): Observable<ApiResponse & { cloudinaryStatus?: CloudinaryStatus }> {
    return this.http.put<ApiResponse & { cloudinaryStatus?: CloudinaryStatus }>(`${this.apiUrl}/cloudinary`, settings).pipe(
      map(response => response),
      catchError(error => {
        throw error;
      })
    );
  }

  /** Cloudinary credentials must live on the production Render server. */
  updateCloudinarySettingsOnProduction(settings: CloudinarySettings): Observable<ApiResponse & { cloudinaryStatus?: CloudinaryStatus }> {
    return this.wakeProductionBackend().pipe(
      switchMap(() =>
        this.http.put<ApiResponse & { cloudinaryStatus?: CloudinaryStatus }>(
          `${PROD_API_URL}/settings/cloudinary`,
          settings,
        ),
      ),
      catchError(error => {
        throw error;
      }),
    );
  }

  /** Check whether production backend can upload to Cloudinary (no auth required). */
  getProductionCloudinaryStatus(): Observable<CloudinaryStatus> {
    return this.wakeProductionBackend().pipe(
      switchMap(() =>
        this.http.get<{ success: boolean; data: CloudinaryStatus }>(`${PROD_API_URL}/uploads/cloudinary-status`),
      ),
      map((res) => res.data),
      catchError(() => of({
        configured: false,
        source: 'none' as const,
        cloudName: null,
        apiKeySet: false,
        apiSecretSet: false,
        connectionOk: false,
        connectionError: 'Could not reach production backend',
        uploadReady: false,
        messageKey: 'CLOUDINARY_STATUS_BACKEND_UNREACHABLE',
      })),
    );
  }

  getCloudinaryStatus(): Observable<CloudinaryStatus> {
    return this.http.get<{ success: boolean; data: CloudinaryStatus }>(`${this.apiUrl}/cloudinary/status`).pipe(
      map((res) => res.data),
      catchError(() => of({
        configured: false,
        source: 'none' as const,
        cloudName: null,
        apiKeySet: false,
        apiSecretSet: false,
        connectionOk: null,
        connectionError: null,
        uploadReady: false,
        messageKey: 'CLOUDINARY_STATUS_NOT_CONFIGURED',
      })),
    );
  }

  private wakeProductionBackend(): Observable<void> {
    return this.http.get<{ status: string }>(`${PROD_API_URL}/health`).pipe(
      map(() => undefined),
      retry({
        count: 12,
        delay: (error, retryCount) => {
          const status = error?.status ?? 0;
          if (status === 0 || status === 502 || status === 503 || status === 504) {
            return timer(Math.min(4000 + retryCount * 2000, 12000));
          }
          return throwError(() => error);
        },
      }),
      catchError(() => of(undefined)),
    );
  }

  updateAiSettings(settings: AiGenerationSettings): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.apiUrl}/ai`, settings).pipe(
      map(response => response),
      catchError(error => {
        throw error;
      })
    );
  }

  updateSMTPSettings(settings: SMTPSettings): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.apiUrl}/smtp`, settings).pipe(
      map(response => response),
      catchError(error => {
        throw error;
      })
    );
  }
}

