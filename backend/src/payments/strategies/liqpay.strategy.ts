import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { Observable, of } from 'rxjs';
import { PaymentStrategy, PaymentData, PaymentResult, WebhookData } from '../interfaces/payment-strategy.interface';
import { PaymentMethod, Currency } from '../entities/payment.entity';

// LiqPay specific payment data interface
export interface LiqPayPaymentData {
  // Base64-encoded JSON of params as required by LiqPay
  data: string;
  // Signature computed as base64(sha1(private_key + data + private_key))
  signature: string;
  // Optional: plain params for debugging in client
  params?: {
    action: string;
    amount: number;
    currency: string;
    description: string;
    order_id: string;
    result_url: string;
    server_url: string;
    language: string;
    sandbox: number;
    public_key: string;
  };
}

@Injectable()
export class LiqPayStrategy implements PaymentStrategy<LiqPayPaymentData> {
  private readonly publicKey: string;
  private readonly privateKey: string;
  private readonly isSandbox: boolean;
  private readonly frontendUrl: string;
  private readonly backendUrl: string;

  constructor(private configService: ConfigService) {
    this.publicKey = this.configService.get<string>('LIQPAY_PUBLIC_KEY');
    this.privateKey = this.configService.get<string>('LIQPAY_PRIVATE_KEY');
    this.isSandbox = this.configService.get<string>('NODE_ENV') === 'development';
    this.frontendUrl = this.configService.get<string>('FRONTEND_URL');
    this.backendUrl = this.configService.get<string>('BACKEND_URL');
  }

  createPayment(paymentData: PaymentData): Observable<PaymentResult<LiqPayPaymentData>> {
    // Validate currency support
    if (!this.isSupported(paymentData.currency as Currency)) {
      return of({
        success: false,
        error: `Currency ${paymentData.currency} is not supported by LiqPay`
      });
    }

    try {
      // Create LiqPay payment parameters
      const params = {
        action: 'pay',
        amount: paymentData.amount,
        currency: paymentData.currency,
        description: paymentData.description || `Order #${paymentData.orderId}`,
        order_id: paymentData.orderId.toString(),
        result_url: `${this.frontendUrl}/payment/success`,
        server_url: `${this.backendUrl}/payments/liqpay/webhook`,
        language: 'uk',
        sandbox: this.isSandbox ? 1 : 0,
        public_key: this.publicKey
      };

      // Prepare base64-encoded data and signature for LiqPay form
      const data = Buffer.from(JSON.stringify(params)).toString('base64');
      const signature = this.generateSignature(data);

      const liqpayData: LiqPayPaymentData = {
        data,
        signature,
        params
      };

      return of({
        success: true,
        data: liqpayData,
        paymentId: paymentData.orderId.toString()
      });

    } catch (error) {
      return of({
        success: false,
        error: 'Failed to create LiqPay payment'
      });
    }
  }

  verifyWebhook(data: string, signature: string): Observable<boolean> {
    try {
      // `data` is already base64-encoded payload from LiqPay
      const calculatedSignature = this.generateSignature(data);
      return of(calculatedSignature === signature);
    } catch (error) {
      return of(false);
    }
  }

  processWebhook(webhookData: WebhookData): Observable<PaymentResult> {
    try {
      // Parse LiqPay webhook data
      const decodedData = Buffer.from(webhookData.orderId, 'base64').toString('utf-8');
      const parsedData = JSON.parse(decodedData);

      return of({
        success: true,
        data: parsedData,
        paymentId: webhookData.orderId,
        transactionId: webhookData.transactionId
      });

    } catch (error) {
      return of({
        success: false,
        error: 'Failed to process LiqPay webhook'
      });
    }
  }

  getPaymentMethod(): PaymentMethod {
    return PaymentMethod.LIQPAY;
  }

  isSupported(currency: Currency): boolean {
    // LiqPay supports UAH, USD, EUR
    return [Currency.UAH, Currency.USD, Currency.EUR].includes(currency);
  }

  private generateSignature(dataBase64: string): string {
    // LiqPay signature format: base64(sha1(private_key + data + private_key))
    const toHash = this.privateKey + dataBase64 + this.privateKey;
    return crypto.createHash('sha1').update(toHash).digest('base64');
  }
} 