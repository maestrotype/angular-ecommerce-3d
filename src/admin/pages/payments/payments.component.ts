import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { PaymentService, PaymentSearchFilters, UpdatePaymentStatusRequest } from '../../services/payment.service';
import { Payment } from '../../models/payment.model';
import { ErrorHandlerService } from '../../services/error-handler.service';

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
    private errorHandler: ErrorHandlerService
  ) {
    // Form will be initialized in ngOnInit
  }

  ngOnInit(): void {
    try {
      // Initialize form first
      this.initializeForm();
      
      // Verify form was created
      if (!this.filtersForm) {
        console.error('Payment filters form was not initialized');
        return;
      }
      
      // Then load data
      this.loadPayments();
      this.loadPaymentStats();
      
      console.log('Payments component initialized successfully');
    } catch (error) {
      console.error('Failed to initialize payments component:', error);
    }
  }

  private initializeForm(): void {
    try {
      this.filtersForm = this.fb.group({
        status: [''],
        paymentMethod: [''],
        customerEmail: [''],
        minAmount: [''],
        maxAmount: [''],
        startDate: [''],
        endDate: ['']
      });
      console.log('Payment filters form initialized successfully');
    } catch (error) {
      console.error('Failed to initialize payment filters form:', error);
      // Create a minimal form as fallback
      this.filtersForm = this.fb.group({});
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadPayments(): void {
    this.isLoading = true;
    // Default load uses simple list and stats length for paginator length
    this.paymentService.getAllPayments().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (payments) => {
        this.payments = payments || [];
        this.isLoading = false;
        // Use totalPayments for initial length when no filters applied
        this.length = this.totalPayments || payments.length || 0;
      },
      error: (error) => {
        console.error('Failed to load payments:', error);
        this.payments = [];
        this.isLoading = false;
        this.length = 0;
        if (this.errorHandler && typeof this.errorHandler.handleGlobalError === 'function') {
          this.errorHandler.handleGlobalError(error);
        }
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
        // Update paginator length after stats are loaded
        this.length = this.totalPayments;
      },
      error: (error) => {
        console.error('Failed to load payment stats:', error);
        // Set default values on error
        this.totalPayments = 0;
        this.totalAmount = 0;
        this.successRate = 0;
        this.length = 0;
        if (this.errorHandler && typeof this.errorHandler.handleGlobalError === 'function') {
          this.errorHandler.handleGlobalError(error);
        }
      }
    });
  }

  // Formatters
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

  // Safe formatting methods
  formatAmount(amount: number | null | undefined): string {
    if (amount == null || isNaN(amount)) return '0.00';
    return amount.toFixed(2);
  }

  formatCurrency(currency: string | null | undefined): string {
    return currency || 'USD';
  }

  formatSuccessRate(rate: number | null | undefined): string {
    if (rate == null || isNaN(rate)) return '0.0';
    return rate.toFixed(1);
  }

  getPaymentMethodIcon(method: string | null | undefined): string {
    switch (method) {
      case 'stripe': return 'credit_card';
      case 'liqpay': return 'account_balance';
      case 'paypal': return 'account_balance_wallet';
      default: return 'payment';
    }
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

  // Actions
  applyFilters(): void {
    try {
      if (!this.filtersForm || !this.filtersForm.value) {
        console.error('Cannot apply filters: form not initialized');
        return;
      }
      
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
          // When filters are applied we do not know total count precisely; use current size
          this.length = payments.length;
        },
        error: (error) => {
          console.error('Failed to apply filters:', error);
          this.isLoading = false;
          this.payments = [];
          this.length = 0;
          if (this.errorHandler && typeof this.errorHandler.handleGlobalError === 'function') {
            this.errorHandler.handleGlobalError(error);
          }
        }
      });
    } catch (error) {
      console.error('Error applying filters:', error);
      this.isLoading = false;
    }
  }

  resetFilters(): void {
    try {
      if (!this.filtersForm) {
        console.error('Cannot reset filters: form not initialized');
        return;
      }
      
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
    } catch (error) {
      console.error('Error resetting filters:', error);
    }
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
    const body: UpdatePaymentStatusRequest = { status, notes: `Updated via admin at ${new Date().toISOString()}` };
    this.paymentService.updatePaymentStatus(payment.id, body).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (updated) => {
        // Update local state
        const idx = this.payments.findIndex(p => p.id === payment.id);
        if (idx >= 0) {
          this.payments[idx] = { ...this.payments[idx], status: updated.status } as Payment;
        }
        if (this.errorHandler && typeof this.errorHandler.showSuccess === 'function') {
          this.errorHandler.showSuccess('Payment status updated');
        }
      },
      error: (error) => {
        console.error('Failed to update payment status:', error);
        if (this.errorHandler && typeof this.errorHandler.handleGlobalError === 'function') {
          this.errorHandler.handleGlobalError(error);
        }
      }
    });
  }

  viewPayment(payment: Payment): void {
    // Placeholder for modal implementation
    if (this.errorHandler && typeof this.errorHandler.showInfo === 'function') {
      this.errorHandler.showInfo(`Payment #${payment.id}`);
    }
  }

  viewOrder(orderId: number): void {
    // Placeholder for navigation to order details
    if (this.errorHandler && typeof this.errorHandler.showInfo === 'function') {
      this.errorHandler.showInfo(`Open order #${orderId}`);
    }
  }

  private hasActiveFilters(): boolean {
    try {
      if (!this.filtersForm || !this.filtersForm.value) {
        return false;
      }
      const v = this.filtersForm.value;
      return !!(v.status || v.paymentMethod || v.customerEmail || v.minAmount || v.maxAmount || v.startDate || v.endDate);
    } catch (error) {
      console.error('Error checking active filters:', error);
      return false;
    }
  }
} 