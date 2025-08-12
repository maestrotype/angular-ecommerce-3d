import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { PaymentStrategy, PaymentData, PaymentResult, WebhookData } from '../interfaces/payment-strategy.interface';
import { PaymentMethod, Currency } from '../entities/payment.entity';

// LiqPay specific payment data interface
export interface LiqPayPaymentData {
  params: {
    action: string;
    amount: number;
    currency: string;
    description: string;
    order_id: string;
    result_url: string;
    server_url: string;
    language: string;
    sandbox: number;
  };
  signature: string;
  publicKey: string;
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

    if (!this.publicKey || !this.privateKey) {
      // Configuration error will be handled by the calling service
    }
  }

  createPayment(paymentData: PaymentData): Observable<PaymentResult<LiqPayPaymentData>> {
    // Validate currency support
    if (!this.isSupported(paymentData.currency)) {
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
        sandbox: this.isSandbox ? 1 : 0
      };

      // Generate signature for LiqPay
      const signature = this.generateSignature(params);

      const liqpayData: LiqPayPaymentData = {
        params,
        signature,
        publicKey: this.publicKey
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

  private generateSignature(data: any): string {
    try {
      // Convert data to string if it's an object
      const dataString = typeof data === 'string' ? data : JSON.stringify(data);
      
      // LiqPay signature format: private_key + data + private_key
      const signatureString = this.privateKey + dataString + this.privateKey;
      
      // Generate SHA1 hash
      const crypto = require('crypto');
      return crypto.createHash('sha1').update(signatureString).digest('base64');
      
    } catch (error) {
      throw new Error('Signature generation failed');
    }
  }
} 