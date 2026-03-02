import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

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

@Injectable({
  providedIn: 'root'
})
export class PaymentSettingsService {

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  getPaymentSettings(): Observable<PaymentSettings> {
    // Primary source: backend settings (grouped)
    return this.http.get<{ success: boolean; data?: { payment?: PaymentSettings } }>(`${environment.apiUrl}/settings`).pipe(
      map(res => {
        const settings = (res && res.success && res.data && res.data.payment) ? res.data.payment : null;
        if (settings) {
          // Cache for fallback usage
          this.setLocalPaymentSettings(settings);
          return settings;
        }
        // Fallback to cached/local defaults
        return this.getLocalPaymentSettings();
      }),
      catchError(() => of(this.getLocalPaymentSettings()))
    );
  }

  private getLocalPaymentSettings(): PaymentSettings {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const stored = localStorage.getItem('paymentSettings');
        if (stored) {
          return JSON.parse(stored);
        }
      } catch (error) {
        // Silent fallback
      }
    }

    // Default fallback
    return {
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
    };
  }

  private setLocalPaymentSettings(settings: PaymentSettings): void {
    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.setItem('paymentSettings', JSON.stringify(settings));
      } catch { }
    }
  }

  getEnabledPaymentMethods(): Observable<Array<{ id: string, name: string, icon: string, description: string }>> {
    return this.getPaymentSettings().pipe(
      map(settings => {
        const methods = [];

        // Only show Stripe if enabled AND has valid keys
        if (settings.stripeEnabled && settings.stripePublishableKey && settings.stripePublishableKey.trim()) {
          methods.push({
            id: 'stripe',
            name: 'Stripe',
            icon: 'payment',
            description: 'Credit card payment'
          });
        }

        // Only show LiqPay if enabled AND has valid keys
        if (settings.liqpayEnabled && settings.liqpayPublicKey && settings.liqpayPublicKey.trim()) {
          methods.push({
            id: 'liqpay',
            name: 'LiqPay',
            icon: 'credit_card',
            description: 'Secure online payment'
          });
        }

        // Only show PayPal if enabled AND has valid keys
        if (settings.paypalEnabled && settings.paypalClientId && settings.paypalClientId.trim()) {
          methods.push({
            id: 'paypal',
            name: 'PayPal',
            icon: 'account_balance_wallet',
            description: 'Pay with PayPal'
          });
        }

        return methods;
      })
    );
  }
} 