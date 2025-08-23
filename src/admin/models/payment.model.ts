export interface Payment {
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

export interface PaymentStats {
	totalPayments: number;
	totalAmount: number;
	successRate: number;
} 