import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, of } from "rxjs";
import { map, catchError } from "rxjs/operators";
import { environment } from '../../environments/environment';
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

export interface AppSettings {
  general?: GeneralSettings;
  notifications?: NotificationSettings;
  security?: SecuritySettings;
  payment?: PaymentSettings;
}

@Injectable({
  providedIn: "root",
})
export class SettingsService {
  private apiUrl = environment.apiUrl + "/settings";

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
}
