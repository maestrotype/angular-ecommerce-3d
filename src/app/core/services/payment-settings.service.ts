import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

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

  getPaymentSettings(): Observable<PaymentSettings> {
    const localSettings = this.getLocalPaymentSettings();
    return of(localSettings);
  }

  private getLocalPaymentSettings(): PaymentSettings {
    try {
      const stored = localStorage.getItem('paymentSettings');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      // Silent fallback
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

  getEnabledPaymentMethods(): Observable<Array<{id: string, name: string, icon: string, description: string}>> {
    return this.getPaymentSettings().pipe(
      map(settings => {
        const methods = [];

        if (settings.stripeEnabled) {
          methods.push({
            id: 'stripe',
            name: 'Stripe',
            icon: 'payment',
            description: 'Credit card payment'
          });
        }

        if (settings.liqpayEnabled) {
          methods.push({
            id: 'liqpay',
            name: 'LiqPay',
            icon: 'credit_card',
            description: 'Secure online payment'
          });
        }

        if (settings.paypalEnabled) {
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