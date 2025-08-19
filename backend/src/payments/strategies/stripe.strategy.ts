import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable, from, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
// @ts-ignore - ensure types are available when stripe is installed
import Stripe from 'stripe';
import { PaymentStrategy, PaymentData, PaymentResult } from '../interfaces/payment-strategy.interface';

export interface StripeIntentData {
  clientSecret: string;
}

@Injectable()
export class StripeStrategy implements PaymentStrategy<StripeIntentData> {
  private stripe: Stripe | null = null;

  constructor(private configService: ConfigService) {
    const secret = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (secret && secret.trim().length > 0) {
      this.stripe = new Stripe(secret);
    }
  }

  createPayment(paymentData: PaymentData): Observable<PaymentResult<StripeIntentData>> {
    if (!this.stripe) {
      return of({ success: false, error: 'Stripe is not configured: missing STRIPE_SECRET_KEY' });
    }

    const amountInMinor = Math.round(Number(paymentData.amount) * 100);

    return from(
      this.stripe.paymentIntents.create({
        amount: amountInMinor,
        currency: String(paymentData.currency || 'usd').toLowerCase() as any,
        description: paymentData.description || `Order #${paymentData.orderId}`,
        metadata: {
          orderId: String(paymentData.orderId),
          customerEmail: paymentData.customerEmail || '',
          customerPhone: paymentData.customerPhone || ''
        },
        automatic_payment_methods: { enabled: true }
      })
    ).pipe(
      map((intent) => ({ success: true, data: { clientSecret: intent.client_secret as string }, paymentId: String(intent.id) })),
      catchError((error) => of({ success: false, error: error?.message || 'Failed to create Stripe PaymentIntent' }))
    );
  }

  verifyWebhook(): Observable<boolean> { return of(true); }
  isSupported(): boolean { return true; }
} 