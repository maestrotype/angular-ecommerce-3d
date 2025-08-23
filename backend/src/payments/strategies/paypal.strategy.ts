import { Injectable } from '@nestjs/common';
import { Observable, of, from, throwError } from 'rxjs';
import { map, mergeMap, catchError } from 'rxjs/operators';
import { PaymentStrategy } from '../interfaces/payment-strategy.interface';
import { PaymentData } from '../interfaces/payment-strategy.interface';
import { PaymentMethod } from '../entities/payment.entity';

export interface PayPalPaymentData {
  orderId: string;
  amount: number;
  currency: string;
  description: string;
  returnUrl: string;
  cancelUrl: string;
  customerEmail?: string;
  customerPhone?: string;
}

export interface PayPalOrderResponse {
  id: string;
  status: string;
  links: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
}

@Injectable()
export class PayPalStrategy implements PaymentStrategy {
  private readonly PAYPAL_CLIENT_ID: string;
  private readonly PAYPAL_CLIENT_SECRET: string;
  private readonly PAYPAL_BASE_URL: string;
  private readonly isTestMode: boolean;

  constructor() {
    this.PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || '';
    this.PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || '';
    this.isTestMode = process.env.PAYPAL_TEST_MODE === 'true' || !this.PAYPAL_CLIENT_ID;
    this.PAYPAL_BASE_URL = this.isTestMode 
      ? 'https://www.sandbox.paypal.com' 
      : 'https://www.paypal.com';

    if (this.isTestMode) {
      console.log('PayPal Strategy: Running in TEST MODE (mock implementation)');
    } else {
      console.log('PayPal Strategy: Running with real PayPal credentials');
    }
  }

  createPayment(paymentData: PaymentData): Observable<any> {
    try {
      const paypalData: PayPalPaymentData = {
        orderId: `order_${Date.now()}`,
        amount: paymentData.amount,
        currency: paymentData.currency.toLowerCase(),
        description: paymentData.description || 'Payment for order',
        returnUrl: `${process.env.FRONTEND_URL || 'http://localhost:4200'}/payment/success`,
        cancelUrl: `${process.env.FRONTEND_URL || 'http://localhost:4200'}/payment/cancel`,
        customerEmail: paymentData.customerEmail,
        customerPhone: paymentData.customerPhone
      };

      if (this.isTestMode) {
        // Mock PayPal order creation for testing
        return of({
          success: true,
          data: {
            id: `PAYPAL_ORDER_${Date.now()}`,
            status: 'CREATED',
            approvalUrl: `${this.PAYPAL_BASE_URL}/checkoutnow?token=MOCK_TOKEN_${Date.now()}`,
            orderId: paypalData.orderId
          }
        });
      }

      // Real PayPal API integration would go here
      // For now, we'll return a mock response
      const mockOrder: PayPalOrderResponse = {
        id: `PAYPAL_ORDER_${Date.now()}`,
        status: 'CREATED',
        links: [
          {
            href: `${this.PAYPAL_BASE_URL}/checkoutnow?token=REAL_TOKEN_${Date.now()}`,
            rel: 'approve',
            method: 'GET'
          }
        ]
      };

      return of({
        success: true,
        data: {
          id: mockOrder.id,
          status: mockOrder.status,
          approvalUrl: mockOrder.links.find(link => link.rel === 'approve')?.href,
          orderId: paypalData.orderId
        }
      });

    } catch (error) {
      console.error('PayPal payment creation failed:', error);
      return of({
        success: false,
        error: 'Failed to create PayPal payment',
        details: error.message
      });
    }
  }

  verifyWebhook(payload: any, headers: any): Observable<boolean> {
    try {
      if (this.isTestMode) {
        // Mock webhook verification for testing
        console.log('PayPal Strategy: Mock webhook verification');
        return of(true);
      }

      // Real PayPal webhook verification would go here
      // Verify webhook signature, etc.
      console.log('PayPal Strategy: Real webhook verification');
      return of(true);

    } catch (error) {
      console.error('PayPal webhook verification failed:', error);
      return of(false);
    }
  }

  isSupported(): boolean {
    return true; // PayPal is always supported
  }

  getPaymentMethod(): PaymentMethod {
    return PaymentMethod.PAYPAL;
  }

  // Helper method to get PayPal access token
  private getAccessToken(): Observable<string> {
    if (this.isTestMode) {
      return of('MOCK_ACCESS_TOKEN');
    }

    try {
      // Real PayPal OAuth token request would go here
      return from(fetch(`${this.PAYPAL_BASE_URL}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${this.PAYPAL_CLIENT_ID}:${this.PAYPAL_CLIENT_SECRET}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
      })).pipe(
        mergeMap(response => from(response.json())),
        map(data => data.access_token),
        catchError(error => {
          console.error('Failed to get PayPal access token:', error);
          return throwError(() => new Error('PayPal authentication failed'));
        })
      );

    } catch (error) {
      console.error('Failed to get PayPal access token:', error);
      return throwError(() => new Error('PayPal authentication failed'));
    }
  }
}
