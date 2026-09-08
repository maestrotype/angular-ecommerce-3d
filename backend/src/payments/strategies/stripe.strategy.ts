import { createRequire } from 'module';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable, from, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { PaymentStrategy, PaymentData, PaymentResult } from '../interfaces/payment-strategy.interface';
import { PaymentMethod } from '../entities/payment.entity';

export interface StripeIntentData {
  clientSecret: string;
}

type StripeClient = {
  paymentIntents: {
    create: (params: Record<string, unknown>) => Promise<{ id: string; client_secret: string | null }>;
  };
  webhooks: {
    constructEvent: (payload: string, signature: string, secret: string) => unknown;
  };
};

type StripeConstructor = new (secret: string) => StripeClient;

function loadStripeConstructor(): StripeConstructor | null {
  try {
    // Lazy load so mock mode works when stripe is not installed.
    const nodeRequire = createRequire(__filename);
    const stripeModule = nodeRequire('stripe') as StripeConstructor & { default?: StripeConstructor };
    const ctor = stripeModule.default ?? stripeModule;
    return typeof ctor === 'function' ? ctor : null;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn('[Stripe] stripe package unavailable:', message);
    return null;
  }
}

@Injectable()
export class StripeStrategy implements PaymentStrategy<StripeIntentData> {
  private stripe: StripeClient | null = null;
  private webhookSecret: string | null = null;

  constructor(private configService: ConfigService) {
    console.log('[Stripe] Constructor called');

    let secret = this.configService.get<string>('STRIPE_SECRET_KEY');
    console.log('[Stripe] ConfigService STRIPE_SECRET_KEY:', secret ? '***' + secret.slice(-4) : 'NOT SET');

    if (!secret) {
      secret = process.env.STRIPE_SECRET_KEY;
      console.log('[Stripe] Fallback to process.env STRIPE_SECRET_KEY:', secret ? '***' + secret.slice(-4) : 'NOT SET');
    }

    if (secret && secret.trim().length > 0 && secret !== 'sk_test_mock_key_for_testing_only') {
      const StripeCtor = loadStripeConstructor();
      if (!StripeCtor) {
        console.warn('[Stripe] Running in mock mode — stripe package not available');
      } else {
        try {
          console.log('[Stripe] Attempting to create Stripe instance with key:', secret.substring(0, 20) + '...' + secret.substring(secret.length - 4));
          this.stripe = new StripeCtor(secret);
          console.log('[Stripe] Real Stripe instance created successfully');
        } catch (error) {
          console.error('[Stripe] Failed to create Stripe instance:', error);
          this.stripe = null;
        }
      }
    } else {
      console.log('[Stripe] Running in mock mode - no valid Stripe keys provided');
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
      console.log('[Stripe] Mock mode: Creating fake PaymentIntent for order:', paymentData.orderId);
      const mockClientSecret = 'pi_mock_' + Date.now() + '_secret_' + Math.random().toString(36).substr(2, 9);

      return of({
        success: true,
        data: { clientSecret: mockClientSecret },
        paymentId: 'pi_mock_' + Date.now()
      });
    }

    const amount = Number(paymentData.amount);
    const currency = String(paymentData.currency || 'USD').toUpperCase();

    const minAmounts: { [key: string]: number } = {
      'USD': 0.50,
      'EUR': 0.50,
      'GBP': 0.30,
      'UAH': 10.00,
      'RUB': 30.00
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

    return from(
      this.stripe.paymentIntents.create({
        amount: amountInMinor,
        currency: currency.toLowerCase(),
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
      this.stripe.webhooks.constructEvent(data, signature, this.webhookSecret);
      return of(true);
    } catch (err: any) {
      console.error('[Stripe] Webhook verification failed:', err.message);
      return of(false);
    }
  }

  isSupported(_currency: unknown): boolean {
    return true;
  }

  getPaymentMethod(): PaymentMethod {
    return PaymentMethod.STRIPE;
  }
}
