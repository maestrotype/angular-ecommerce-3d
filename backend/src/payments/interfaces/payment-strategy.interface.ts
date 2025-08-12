import { Observable } from 'rxjs';
import { PaymentMethod, Currency } from '../entities/payment.entity';

// Generic payment data interface
export interface PaymentData {
  orderId: number;
  amount: number;
  currency: Currency;
  description?: string;
  customerEmail?: string;
  customerPhone?: string;
}

// Generic payment result interface
export interface PaymentResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  paymentId?: string;
  transactionId?: string;
}

// Generic webhook data interface
export interface WebhookData {
  orderId: string;
  status: string;
  amount: number;
  currency: string;
  transactionId?: string;
  errorMessage?: string;
}

// Generic payment strategy interface
export interface PaymentStrategy<T = any> {
  // Create payment and return payment data
  createPayment(paymentData: PaymentData): Observable<PaymentResult<T>>;
  
  // Verify webhook signature
  verifyWebhook(data: string, signature: string): Observable<boolean>;
  
  // Process webhook data
  processWebhook(webhookData: WebhookData): Observable<PaymentResult>;
  
  // Get payment method type
  getPaymentMethod(): PaymentMethod;
  
  // Check if payment method is supported
  isSupported(currency: Currency): boolean;
} 