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
    console.log('[Stripe] Constructor called');
    
    // Try ConfigService first, then fallback to process.env
    let secret = this.configService.get<string>('STRIPE_SECRET_KEY');
    console.log('[Stripe] ConfigService STRIPE_SECRET_KEY:', secret ? '***' + secret.slice(-4) : 'NOT SET');
    
    if (!secret) {
      secret = process.env.STRIPE_SECRET_KEY;
      console.log('[Stripe] Fallback to process.env STRIPE_SECRET_KEY:', secret ? '***' + secret.slice(-4) : 'NOT SET');
    }
    
    if (secret && secret.trim().length > 0 && secret !== 'sk_test_mock_key_for_testing_only') {
      try {
        console.log('[Stripe] Attempting to create Stripe instance with key:', secret.substring(0, 20) + '...' + secret.substring(secret.length - 4));
        // CJS/ESM interop: compiled `import Stripe from 'stripe'` may be `{ default: Stripe }`
        const StripeCtor = (Stripe as unknown as { default?: typeof Stripe }).default ?? Stripe;
        this.stripe = new StripeCtor(secret);
        console.log('[Stripe] Real Stripe instance created successfully');
        console.log('[Stripe] Stripe instance methods:', Object.keys(this.stripe));
      } catch (error) {
        console.error('[Stripe] Failed to create Stripe instance:', error);
        this.stripe = null;
      }
    } else {
      console.log('[Stripe] Running in mock mode - no valid Stripe keys provided');
      console.log('[Stripe] Secret key length:', secret ? secret.length : 0);
      console.log('[Stripe] Secret key starts with:', secret ? secret.substring(0, 10) : 'N/A');
    }
    
    let wh = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    if (!wh) {
      wh = process.env.STRIPE_WEBHOOK_SECRET;
    }
    if (wh && wh.trim().length > 0) {
      this.webhookSecret = wh;
      console.log('[Stripe] Webhook secret set:', '***' + wh.slice(-4));
    }
  }

  createPayment(paymentData: PaymentData): Observable<PaymentResult<StripeIntentData>> {
    if (!this.stripe) {
      // Mock mode - return fake client secret for testing
      console.log('[Stripe] Mock mode: Creating fake PaymentIntent for order:', paymentData.orderId);
      console.log('[Stripe] Stripe instance is null. Check if STRIPE_SECRET_KEY is set correctly.');
      const mockClientSecret = 'pi_mock_' + Date.now() + '_secret_' + Math.random().toString(36).substr(2, 9);
      
      return of({ 
        success: true, 
        data: { clientSecret: mockClientSecret }, 
        paymentId: 'pi_mock_' + Date.now() 
      });
    }

    // Check minimum amount for Stripe
    const amount = Number(paymentData.amount);
    const currency = String(paymentData.currency || 'USD').toUpperCase();
    
    // Stripe minimum amounts (in major currency units)
    const minAmounts: { [key: string]: number } = {
      'USD': 0.50,  // $0.50 minimum
      'EUR': 0.50,  // €0.50 minimum
      'GBP': 0.30,  // £0.30 minimum
      'UAH': 10.00, // ₴10.00 minimum
      'RUB': 30.00  // ₽30.00 minimum
    };
    
    const minAmount = minAmounts[currency] || 0.50;
    if (amount < minAmount) {
      const errorMsg = `Amount ${amount} ${currency} is below minimum ${minAmount} ${currency} required by Stripe`;
      console.error('[Stripe]', errorMsg);
      return of({ 
        success: false, 
        error: errorMsg 
      });
    }

    const amountInMinor = Math.round(amount * 100);
    console.log('[Stripe] Creating PaymentIntent:', { amount: amountInMinor, currency, orderId: paymentData.orderId });

    console.log('[Stripe] About to create PaymentIntent with Stripe instance:', !!this.stripe);
    console.log('[Stripe] Stripe instance methods:', Object.keys(this.stripe));
    
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