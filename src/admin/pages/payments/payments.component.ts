import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import {
  AdminPaymentService,
  PaymentSearchFilters,
  UpdatePaymentStatusRequest,
} from '../../services/payment.service';
import { Payment } from '../../models/payment.model';
import { ErrorHandlerService } from '../../services/error-handler.service';
import { PaymentDetailsDialogComponent } from './payment-details-dialog.component';
import { OrderDetailsDialogComponent } from './order-details-dialog.component';
import { TranslateService } from '@ngx-translate/core';

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
    { value: 'all', label: 'STATUS_ALL' },
    { value: 'pending', label: 'STATUS_PENDING' },
    { value: 'processing', label: 'STATUS_PROCESSING' },
    { value: 'completed', label: 'STATUS_COMPLETED' },
    { value: 'failed', label: 'STATUS_FAILED' }
  ];
  methodOptions = [
    { value: 'all', label: 'METHOD_ALL' },
    { value: 'liqpay', label: 'METHOD_LIQPAY' },
    { value: 'stripe', label: 'METHOD_STRIPE' },
    { value: 'paypal', label: 'METHOD_PAYPAL' }
  ];
  
  displayedColumns: string[] = ['id', 'orderId', 'amount', 'paymentMethod', 'status', 'customerEmail', 'createdAt', 'actions'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private paymentService: AdminPaymentService,
    private fb: FormBuilder,
    private errorHandler: ErrorHandlerService,
    private dialog: MatDialog,
    private translate: TranslateService
  ) {
    // Form will be initialized in ngOnInit
  }

  ngOnInit(): void {
    this.initializeForm();
    this.loadPaymentStats();
    
    // Apply default filters to show initial data
    setTimeout(() => {
      this.applyFilters();
    }, 100);
  }

  private initializeForm(): void {
    // Set default values for better UX
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
    
    this.filtersForm = this.fb.group({
      status: ['all'], // Default to show all statuses
      paymentMethod: ['all'], // Default to show all methods
      customerEmail: [''],
      minAmount: ['0'], // Default minimum amount
      maxAmount: ['10000'], // Default maximum amount
      startDate: [lastMonth], // Default to last month
      endDate: [today] // Default to today
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
        
        this.payments = [];
        this.isLoading = false;
        this.length = 0;
        this.errorHandler?.handleGlobalError?.(error);
      }
    });
  }
  
  /**
   * Load all payments without filters (fallback method)
   */
  private loadAllPayments(): void {
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
    
    // Properly handle date conversion for calendar inputs
    const startDate = this.convertCalendarDate(raw.startDate, false);
    const endDate = this.convertCalendarDate(raw.endDate, true);
    
    const filters: PaymentSearchFilters = {
      status: raw.status && raw.status !== 'all' ? raw.status : undefined,
      paymentMethod: raw.paymentMethod && raw.paymentMethod !== 'all' ? raw.paymentMethod : undefined,
      customerEmail: raw.customerEmail || undefined,
      minAmount: raw.minAmount !== '' ? Number(raw.minAmount) : undefined,
      maxAmount: raw.maxAmount !== '' ? Number(raw.maxAmount) : undefined,
      startDate: startDate,
      endDate: endDate,
      limit: 50, // Use larger limit to show more results initially
      offset: 0  // Reset to first page when applying filters
    };
    
    // Debug logging for date conversion

    this.isLoading = true;
    this.paymentService.searchPayments(filters).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (payments) => {
        this.payments = payments || [];
        this.isLoading = false;
        // Reset pagination to first page
        this.pageIndex = 0;
        // Update length for pagination - use totalPayments if available, otherwise use current results
        this.length = this.totalPayments > 0 ? this.totalPayments : payments.length;
      },
      error: (error) => {
        
        this.isLoading = false;
        this.payments = [];
        this.length = 0;
        this.errorHandler?.handleGlobalError?.(error);
      }
    });
  }

  resetFilters(): void {
    if (!this.filtersForm) return;
    
    // Reset to default values instead of empty
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
    
    this.filtersForm.reset({
      status: 'all',
      paymentMethod: 'all',
      customerEmail: '',
      minAmount: '0',
      maxAmount: '10000',
      startDate: lastMonth,
      endDate: today
    });
    
    // Reset pagination
    this.pageIndex = 0;
    this.pageSize = 10; // Reset to default page size
    this.loadPaymentStats();
    this.loadAllPayments();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    if (this.hasActiveFilters()) {
      // When changing pages with active filters, use pagination
      const raw = this.filtersForm?.value;
      
      // Properly handle date conversion for calendar inputs
      const startDate = this.convertCalendarDate(raw?.startDate, false);
      const endDate = this.convertCalendarDate(raw?.endDate, true);
      
      const filters: PaymentSearchFilters = {
        status: raw?.status && raw.status !== 'all' ? raw.status : undefined,
        paymentMethod: raw?.paymentMethod && raw.paymentMethod !== 'all' ? raw.paymentMethod : undefined,
        customerEmail: raw?.customerEmail || undefined,
        minAmount: raw?.minAmount !== '' ? Number(raw.minAmount) : undefined,
        maxAmount: raw?.maxAmount !== '' ? Number(raw.maxAmount) : undefined,
        startDate: startDate,
        endDate: endDate,
        limit: this.pageSize,
        offset: this.pageIndex * this.pageSize
      };
      
      // Debug logging for pagination date conversion
      
      this.isLoading = true;
      this.paymentService.searchPayments(filters).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: (payments) => {
          this.payments = payments || [];
          this.isLoading = false;
        },
        error: (error) => {
          
          this.isLoading = false;
          this.payments = [];
          this.errorHandler?.handleGlobalError?.(error);
        }
      });
    } else {
      this.loadAllPayments();
    }
  }

  updateStatus(payment: Payment, status: 'completed' | 'processing' | 'failed'): void {
    if (!payment?.id) return;
    
    
    
    const body: UpdatePaymentStatusRequest = { 
      status: status, 
      notes: `Updated via admin at ${new Date().toISOString()}` 
    };
    
    
    
    this.paymentService.updatePaymentStatus(payment.id, body).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (updated) => {
        
        
        if (updated) {
          // Update the payment in the local array immediately
          const idx = this.payments.findIndex(p => p.id === payment.id);
          if (idx >= 0) {
            this.payments[idx] = { ...this.payments[idx], status: updated.status } as Payment;
          }
          
          // Force change detection
          this.payments = [...this.payments];
          
          // Reload payment stats to update success rate
          this.loadPaymentStats();
          this.errorHandler?.showSuccess?.(this.translate.instant('PAYMENT_STATUS_UPDATED'));
        } else {
          this.errorHandler?.handleGlobalError?.(this.translate.instant('FAILED_TO_UPDATE_SETTINGS'));
        }
      },
      error: (error) => {
        
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
    
    // Open order details dialog
    this.dialog.open(OrderDetailsDialogComponent, {
      data: { orderId },
      width: '800px',
      maxHeight: '90vh',
      disableClose: false
    });
  }

  hasActiveFilters(): boolean {
    if (!this.filtersForm?.value) return false;
    const v = this.filtersForm.value;
    
    // Check if any non-default filters are active
    const hasStatusFilter = v.status && v.status !== 'all';
    const hasMethodFilter = v.paymentMethod && v.paymentMethod !== 'all';
    const hasEmailFilter = v.customerEmail && v.customerEmail.trim() !== '';
    const hasMinAmountFilter = v.minAmount && v.minAmount !== '0';
    const hasMaxAmountFilter = v.maxAmount && v.maxAmount !== '10000';
    const hasDateFilter = v.startDate || v.endDate;
    
    return !!(hasStatusFilter || hasMethodFilter || hasEmailFilter || hasMinAmountFilter || hasMaxAmountFilter || hasDateFilter);
  }
  
  /**
   * Convert calendar date inputs to proper UTC dates for API queries
   * @param dateInput - Date from calendar input
   * @param isEndDate - Whether this is an end date (will be set to end of day)
   * @returns UTC Date object or undefined
   */
  private convertCalendarDate(dateInput: any, isEndDate: boolean = false): Date | undefined {
    if (!dateInput) return undefined;
    
    try {
      const localDate = new Date(dateInput);
      
      if (isEndDate) {
        // For end date, set to end of day (23:59:59.999)
        return new Date(Date.UTC(
          localDate.getFullYear(), 
          localDate.getMonth(), 
          localDate.getDate(), 
          23, 59, 59, 999
        ));
      } else {
        // For start date, set to start of day (00:00:00.000)
        return new Date(Date.UTC(
          localDate.getFullYear(), 
          localDate.getMonth(), 
          localDate.getDate(), 
          0, 0, 0, 0
        ));
      }
    } catch (error) {
      
      return undefined;
    }
  }
} 