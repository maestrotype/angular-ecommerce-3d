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

/** Admin payments overview stats */
export interface PaymentStats {
  totalPayments: number;
  totalAmount: number;
  successRate: number;
}

/** Admin list row — nullable fields from legacy API responses */
export interface AdminPaymentRecord {
  id: number | null;
  orderId: number | null;
  amount: number | string;
  currency: 'UAH' | 'USD' | 'EUR' | null | undefined;
  paymentMethod: 'liqpay' | 'stripe' | 'paypal' | null | undefined;
  status: 'pending' | 'processing' | 'completed' | 'failed' | null | undefined;
  description?: string;
  transactionId?: string;
  liqpayPaymentId?: string;
  customerEmail?: string | null;
  customerPhone?: string | null;
  metadata?: string;
  createdAt: string | null;
  updatedAt: string | null;
} 