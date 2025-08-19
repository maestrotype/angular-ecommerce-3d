export interface Payment {
  id: number;
  orderId: number;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: PaymentStatus;
  transactionId?: string;
  liqpayPaymentId?: string;
  paymentIntentId?: string;
  description?: string;
  customerEmail: string;
  customerPhone?: string;
  errorMessage?: string;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

export interface PaymentRequest {
  orderId: number;
  amount: number;
  currency: string;
  paymentMethod: string;
  customerEmail: string;
  customerPhone?: string;
  description?: string;
}

export interface PaymentResponse {
  success: boolean;
  message: string;
  payment?: Payment;
  redirectUrl?: string;
  error?: string;
} 