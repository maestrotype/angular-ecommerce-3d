export interface PaymentData {
  orderId: number;
  amount: number;
  currency: string;
  description?: string;
  customerEmail?: string;
  customerPhone?: string;
}

export interface PaymentResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  paymentId?: string;
  transactionId?: string;
}

export interface WebhookData {
  orderId: string;
  status: string;
  transactionId?: string;
}

export interface PaymentStrategy<TPaymentData = any> {
  createPayment(paymentData: PaymentData): import('rxjs').Observable<PaymentResult<TPaymentData>>;
  verifyWebhook(data: string, signature: string): import('rxjs').Observable<boolean>;
  processWebhook?(webhookData: WebhookData): import('rxjs').Observable<PaymentResult>;
  isSupported(currency: any): boolean;
} 