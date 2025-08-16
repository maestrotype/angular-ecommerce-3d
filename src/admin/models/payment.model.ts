export interface Payment {
	id: number;
	orderId: number;
	amount: number;
	currency: 'UAH' | 'USD' | 'EUR';
	paymentMethod: 'liqpay' | 'stripe' | 'paypal';
	status: 'pending' | 'processing' | 'completed' | 'failed';
	description?: string;
	transactionId?: string;
	liqpayPaymentId?: string;
	customerEmail?: string;
	customerPhone?: string;
	metadata?: string;
	createdAt: string;
	updatedAt: string;
}

export interface PaymentStats {
	totalPayments: number;
	totalAmount: number;
	successRate: number;
} 