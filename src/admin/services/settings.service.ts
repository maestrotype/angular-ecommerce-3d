import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, of } from "rxjs";
import { environment } from "src/environments/environment.prod";

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

export interface AppSettings {
  general?: GeneralSettings;
  notifications?: NotificationSettings;
  security?: SecuritySettings;
}

@Injectable({
  providedIn: "root",
})
export class SettingsService {
  private apiUrl = environment.apiUrl + "/settings";

  constructor(private http: HttpClient) {}

  getSettings(): Observable<AppSettings> {
    // For now, return mock data since backend might not be ready
    return of({
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
    });
  }

  updateGeneralSettings(settings: GeneralSettings): Observable<any> {
    return this.http.put(`${this.apiUrl}/general`, settings);
  }

  updateNotificationSettings(settings: NotificationSettings): Observable<any> {
    return this.http.put(`${this.apiUrl}/notifications`, settings);
  }

  updateSecuritySettings(settings: SecuritySettings): Observable<any> {
    return this.http.put(`${this.apiUrl}/security`, settings);
  }
}
