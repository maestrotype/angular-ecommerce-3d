import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Payment } from '../../models/payment.model';

@Component({
  selector: 'app-payment-details-dialog',
  templateUrl: './payment-details-dialog.component.html',
  styleUrls: ['./payment-details-dialog.component.scss']
})
export class PaymentDetailsDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<PaymentDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { payment: Payment }
  ) {}

  close(): void {
    this.dialogRef.close();
  }

  formatDate(date: string | Date): string {
    if (!date) return 'N/A';
    const dateObj = new Date(date);
    return isNaN(dateObj.getTime()) ? 'Invalid Date' : dateObj.toLocaleString('ru-RU');
  }

  getStatusColor(status: string): string {
    switch (status?.toLowerCase()) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      case 'processing': return 'info';
      default: return 'default';
    }
  }

  getPaymentMethodIcon(method: string): string {
    switch (method?.toLowerCase()) {
      case 'stripe': return 'credit_card';
      case 'liqpay': return 'account_balance';
      case 'paypal': return 'account_balance_wallet';
      default: return 'payment';
    }
  }

  getErrorMessage(payment: any): string {
    return payment?.errorMessage || 'None';
  }

  getSafeValue(value: any, defaultValue: string = 'N/A'): string {
    return value ? value : defaultValue;
  }
}
