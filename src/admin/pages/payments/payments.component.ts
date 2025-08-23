import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { PaymentService, PaymentSearchFilters, UpdatePaymentStatusRequest } from '../../services/payment.service';
import { Payment } from '../../models/payment.model';
import { ErrorHandlerService } from '../../services/error-handler.service';
import { PaymentDetailsDialogComponent } from './payment-details-dialog.component';

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

  // Paginator state
  pageSize = 10;
  pageIndex = 0;
  length = 0;

  // Filters form
  filtersForm: FormGroup;
  statusOptions = [
    { value: '', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'completed', label: 'Completed' },
    { value: 'failed', label: 'Failed' }
  ];
  methodOptions = [
    { value: '', label: 'All' },
    { value: 'liqpay', label: 'LiqPay' },
    { value: 'stripe', label: 'Stripe' },
    { value: 'paypal', label: 'PayPal' }
  ];
  
  displayedColumns: string[] = ['id', 'orderId', 'amount', 'paymentMethod', 'status', 'customerEmail', 'createdAt', 'actions'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private paymentService: PaymentService,
    private fb: FormBuilder,
    private errorHandler: ErrorHandlerService,
    private dialog: MatDialog
  ) {
    // Form will be initialized in ngOnInit
  }

  ngOnInit(): void {
    this.initializeForm();
    this.loadPayments();
    this.loadPaymentStats();
  }

  private initializeForm(): void {
    this.filtersForm = this.fb.group({
      status: [''],
      paymentMethod: [''],
      customerEmail: [''],
      minAmount: [''],
      maxAmount: [''],
      startDate: [''],
      endDate: ['']
    });
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
        this.payments = payments || [];
        this.isLoading = false;
        this.length = this.totalPayments || payments.length || 0;
      },
      error: (error) => {
        console.error('Failed to load payments:', error);
        this.payments = [];
        this.isLoading = false;
        this.length = 0;
        this.errorHandler?.handleGlobalError?.(error);
      }
    });
  }

  private loadPaymentStats(): void {
    this.paymentService.getPaymentStats().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (stats) => {
        this.totalPayments = stats?.totalPayments || 0;
        this.totalAmount = stats?.totalAmount || 0;
        this.successRate = stats?.successRate || 0;
        this.length = this.totalPayments;
      },
      error: (error) => {
        console.error('Failed to load payment stats:', error);
        this.totalPayments = 0;
        this.totalAmount = 0;
        this.successRate = 0;
        this.length = 0;
        this.errorHandler?.handleGlobalError?.(error);
      }
    });
  }

  getStatusColor(status: string | null | undefined): string {
    if (!status) return 'default';
    switch (status.toLowerCase()) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      case 'processing': return 'info';
      default: return 'default';
    }
  }

  formatAmount(amount: number | string | null | undefined): string {
    if (!amount) return '0.00';
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return isNaN(numAmount) ? '0.00' : numAmount.toFixed(2);
  }

  formatCurrency(currency: string | null | undefined): string {
    return currency || 'USD';
  }

  formatSuccessRate(rate: number | null | undefined): string {
    if (!rate || isNaN(rate)) return '0.0';
    return rate.toFixed(1);
  }

  getPaymentMethodIcon(method: string | null | undefined): string {
    if (!method) return 'payment';
    switch (method.toLowerCase()) {
      case 'stripe': return 'credit_card';
      case 'liqpay': return 'account_balance';
      case 'paypal': return 'account_balance_wallet';
      default: return 'payment';
    }
  }

  formatDate(date: string | null | undefined): string {
    if (!date) return 'N/A';
    const dateObj = new Date(date);
    return isNaN(dateObj.getTime()) ? 'Invalid Date' : dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  applyFilters(): void {
    if (!this.filtersForm?.value) return;
    
    const raw = this.filtersForm.value;
    const filters: PaymentSearchFilters = {
      status: raw.status || undefined,
      paymentMethod: raw.paymentMethod || undefined,
      customerEmail: raw.customerEmail || undefined,
      minAmount: raw.minAmount !== '' ? Number(raw.minAmount) : undefined,
      maxAmount: raw.maxAmount !== '' ? Number(raw.maxAmount) : undefined,
      startDate: raw.startDate ? new Date(raw.startDate) : undefined,
      endDate: raw.endDate ? new Date(raw.endDate) : undefined,
      limit: this.pageSize,
      offset: this.pageIndex * this.pageSize
    };

    this.isLoading = true;
    this.paymentService.searchPayments(filters).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (payments) => {
        this.payments = payments || [];
        this.isLoading = false;
        // Update length for pagination - use totalPayments if available, otherwise use current results
        this.length = this.totalPayments > 0 ? this.totalPayments : payments.length;
      },
      error: (error) => {
        console.error('Failed to apply filters:', error);
        this.isLoading = false;
        this.payments = [];
        this.length = 0;
        this.errorHandler?.handleGlobalError?.(error);
      }
    });
  }

  resetFilters(): void {
    if (!this.filtersForm) return;
    
    this.filtersForm.reset({
      status: '',
      paymentMethod: '',
      customerEmail: '',
      minAmount: '',
      maxAmount: '',
      startDate: '',
      endDate: ''
    });
    this.pageIndex = 0;
    this.loadPaymentStats();
    this.loadPayments();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    if (this.hasActiveFilters()) {
      this.applyFilters();
    } else {
      this.loadPayments();
    }
  }

  updateStatus(payment: Payment, status: 'completed' | 'processing' | 'failed'): void {
    if (!payment?.id) return;
    
    const body: UpdatePaymentStatusRequest = { status, notes: `Updated via admin at ${new Date().toISOString()}` };
    this.paymentService.updatePaymentStatus(payment.id, body).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (updated) => {
        const idx = this.payments.findIndex(p => p.id === payment.id);
        if (idx >= 0) {
          this.payments[idx] = { ...this.payments[idx], status: updated.status } as Payment;
        }
        this.errorHandler?.showSuccess?.('Payment status updated');
      },
      error: (error) => {
        console.error('Failed to update payment status:', error);
        this.errorHandler?.handleGlobalError?.(error);
      }
    });
  }

  viewPayment(payment: Payment): void {
    if (!payment?.id) return;
    
    // Open payment details dialog
    this.dialog.open(PaymentDetailsDialogComponent, {
      data: { payment },
      width: '700px',
      maxHeight: '90vh',
      disableClose: false
    });
  }

  viewOrder(orderId: number | null): void {
    if (!orderId) return;
    this.errorHandler?.showInfo?.(`Open order #${orderId}`);
  }

  hasActiveFilters(): boolean {
    if (!this.filtersForm?.value) return false;
    const v = this.filtersForm.value;
    return !!(v.status || v.paymentMethod || v.customerEmail || v.minAmount || v.maxAmount || v.startDate || v.endDate);
  }
} 