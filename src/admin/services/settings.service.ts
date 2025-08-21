import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, of } from "rxjs";
import { map, catchError } from "rxjs/operators";
import { environment } from "src/environments/environment.prod";
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
    const localSettings = this.getLocalSettings();
    return of(localSettings || this.getMockSettings());
  }



  private getLocalSettings(): AppSettings | null {
    try {
      const general = localStorage.getItem('generalSettings');
      const notifications = localStorage.getItem('notificationSettings');
      const security = localStorage.getItem('securitySettings');
      const payment = localStorage.getItem('paymentSettings');

      if (general || notifications || security || payment) {
        return {
          general: general ? JSON.parse(general) : undefined,
          notifications: notifications ? JSON.parse(notifications) : undefined,
          security: security ? JSON.parse(security) : undefined,
          payment: payment ? JSON.parse(payment) : undefined,
        };
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

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
    localStorage.setItem('generalSettings', JSON.stringify(settings));
    return this.http.put<ApiResponse>(`${this.apiUrl}/general`, settings).pipe(
      catchError(() => of({ success: true, message: 'Settings saved locally' }))
    );
  }

  updateNotificationSettings(settings: NotificationSettings): Observable<ApiResponse> {
    localStorage.setItem('notificationSettings', JSON.stringify(settings));
    return this.http.put<ApiResponse>(`${this.apiUrl}/notifications`, settings).pipe(
      catchError(() => of({ success: true, message: 'Settings saved locally' }))
    );
  }

  updateSecuritySettings(settings: SecuritySettings): Observable<ApiResponse> {
    localStorage.setItem('securitySettings', JSON.stringify(settings));
    return this.http.put<ApiResponse>(`${this.apiUrl}/security`, settings).pipe(
      catchError(() => of({ success: true, message: 'Settings saved locally' }))
    );
  }

  updatePaymentSettings(settings: PaymentSettings): Observable<ApiResponse> {
    // Save to localStorage first for immediate persistence
    localStorage.setItem('paymentSettings', JSON.stringify(settings));
    
    // Then try to save to backend
    return this.http.put<ApiResponse>(`${this.apiUrl}/payment`, settings).pipe(
      map(response => response),
      catchError(error => {
        // Return success since localStorage is already saved
        return of({ success: true, message: 'Settings saved locally' });
      })
    );
  }
}
