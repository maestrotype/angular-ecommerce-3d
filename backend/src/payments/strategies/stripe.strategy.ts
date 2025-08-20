import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable, from, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
// @ts-ignore - ensure types are available when stripe is installed
import Stripe from 'stripe';
import { PaymentStrategy, PaymentData, PaymentResult } from '../interfaces/payment-strategy.interface';
import { PaymentMethod } from '../entities/payment.entity';

export interface StripeIntentData {
  clientSecret: string;
}

@Injectable()
export class StripeStrategy implements PaymentStrategy<StripeIntentData> {
  private stripe: Stripe | null = null;
  private webhookSecret: string | null = null;

  constructor(private configService: ConfigService) {
    const secret = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (secret && secret.trim().length > 0 && secret !== 'sk_test_mock_key_for_testing_only') {
      this.stripe = new Stripe(secret);
      console.log('[Stripe] Real Stripe instance created');
    } else {
      console.log('[Stripe] Running in mock mode - no real Stripe keys provided');
    }
    const wh = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    if (wh && wh.trim().length > 0) {
      this.webhookSecret = wh;
    }
  }

  createPayment(paymentData: PaymentData): Observable<PaymentResult<StripeIntentData>> {
    if (!this.stripe) {
      // Mock mode - return fake client secret for testing
      console.log('[Stripe] Mock mode: Creating fake PaymentIntent for order:', paymentData.orderId);
      const mockClientSecret = 'pi_mock_' + Date.now() + '_secret_' + Math.random().toString(36).substr(2, 9);
      
      return of({ 
        success: true, 
        data: { clientSecret: mockClientSecret }, 
        paymentId: 'pi_mock_' + Date.now() 
      });
    }

    const amountInMinor = Math.round(Number(paymentData.amount) * 100);
    // Ensure currency is uppercase for database enum
    const currency = String(paymentData.currency || 'USD').toUpperCase();
    console.log('[Stripe] Creating PaymentIntent:', { amount: amountInMinor, currency, orderId: paymentData.orderId });

    return from(
      this.stripe.paymentIntents.create({
        amount: amountInMinor,
        currency: currency.toLowerCase() as any, // Stripe expects lowercase
        description: paymentData.description || `Order #${paymentData.orderId}`,
        metadata: {
          orderId: String(paymentData.orderId),
          customerEmail: paymentData.customerEmail || '',
          customerPhone: paymentData.customerPhone || ''
        },
        automatic_payment_methods: { enabled: true }
      })
    ).pipe(
      map((intent) => {
        console.log('[Stripe] PaymentIntent created successfully:', intent.id);
        return { success: true, data: { clientSecret: intent.client_secret as string }, paymentId: String(intent.id) };
      }),
      catchError((error) => {
        console.error('[Stripe] Failed to create PaymentIntent:', error);
        return of({ success: false, error: error?.message || 'Failed to create Stripe PaymentIntent' });
      })
    );
  }

  verifyWebhook(data: string, signature: string): Observable<boolean> {
    if (!this.stripe || !this.webhookSecret) {
      return of(false);
    }
    try {
      const event = this.stripe.webhooks.constructEvent(data, signature, this.webhookSecret);
      return of(true);
    } catch (err: any) {
      console.error('[Stripe] Webhook verification failed:', err.message);
      return of(false);
    }
  }

  isSupported(currency: any): boolean { 
    return true; // Stripe supports many currencies
  }

  getPaymentMethod(): PaymentMethod { 
    return PaymentMethod.STRIPE; 
  }
} 