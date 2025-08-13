export interface Payment {
  id: number;
  orderId: number;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: string;
  transactionId?: string;
  liqpayPaymentId?: string;
  paymentIntentId?: string;
  description?: string;
  customerEmail?: string;
  customerPhone?: string;
  errorMessage?: string;
  metadata?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentStats {
  totalPayments: number;
  totalAmount: number;
  successRate: number;
} 