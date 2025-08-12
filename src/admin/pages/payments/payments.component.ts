import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { PaymentService } from '../../services/payment.service';
import { Payment } from '../../models/payment.model';

@Component({
  selector: 'app-payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.scss']
})
export class PaymentsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  payments: Payment[] = [];
  isLoading = false;
  totalPayments = 0;
  totalAmount = 0;
  successRate = 0;
  
  displayedColumns: string[] = ['id', 'orderId', 'amount', 'paymentMethod', 'status', 'customerEmail', 'createdAt', 'actions'];

  constructor(private paymentService: PaymentService) {}

  ngOnInit(): void {
    this.loadPayments();
    this.loadPaymentStats();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadPayments(): void {
    this.isLoading = true;
    this.paymentService.getAllPayments().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (payments) => {
        this.payments = payments;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Failed to load payments:', error);
      }
    });
  }

  private loadPaymentStats(): void {
    this.paymentService.getPaymentStats().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (stats) => {
        this.totalPayments = stats.totalPayments;
        this.totalAmount = stats.totalAmount;
        this.successRate = stats.successRate;
      },
      error: (error) => {
        console.error('Failed to load payment stats:', error);
      }
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      case 'processing':
        return 'info';
      default:
        return 'default';
    }
  }

  getPaymentMethodIcon(method: string): string {
    switch (method) {
      case 'liqpay':
        return 'credit_card';
      case 'stripe':
        return 'payment';
      case 'paypal':
        return 'account_balance_wallet';
      default:
        return 'payment';
    }
  }

  formatAmount(amount: number): string {
    return `$${amount.toFixed(2)}`;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  viewPayment(payment: Payment): void {
    // TODO: Implement payment details modal
    console.log('View payment:', payment);
  }

  viewOrder(orderId: number): void {
    // TODO: Navigate to order details
    console.log('View order:', orderId);
  }
} 