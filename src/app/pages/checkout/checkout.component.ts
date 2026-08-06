import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil, combineLatest } from 'rxjs';
import { CartService } from '../../core/services/cart.service';
import { CartItem } from '../../../shared/models/cart-item.model';
import { CreateOrderRequest } from '../../../shared/models/create-order-request.model';
import { Order } from '../../../shared/models/order.model';
import { NotificationService } from '../../core/services/notification.service';
import { ModalService } from '../../core/services/modal.service';
import { PaymentSettingsService } from '../../core/services/payment-settings.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  checkoutForm: FormGroup;
  cartItems: CartItem[] = [];
  totalPrice = 0;
  isLoading = false;

  paymentMethods: Array<{ id: string, name: string, icon: string, description: string }> = [];
  selectedPaymentMethod = 'liqpay';

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private router: Router,
    private notificationService: NotificationService,
    private modalService: ModalService,
    private paymentSettingsService: PaymentSettingsService,
    private translate: TranslateService
  ) {
    this.checkoutForm = this.fb.group({
      customerName: ['', [Validators.required, Validators.minLength(2)]],
      customerEmail: ['', [Validators.required, Validators.email]],
      customerPhone: ['', [Validators.required, Validators.pattern(/^\+?[\d\s\-\(\)]+$/)]],
      shippingAddress: ['', [Validators.required, Validators.minLength(10)]],
      city: ['', [Validators.required, Validators.minLength(2)]],
      postalCode: ['', [Validators.required, Validators.pattern(/^[\d\w\s\-]+$/)]],
      country: ['Ukraine', [Validators.required]],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.loadCartData();
    this.loadPaymentMethods();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadPaymentMethods(): void {
    this.paymentSettingsService.getEnabledPaymentMethods().pipe(
      takeUntil(this.destroy$)
    ).subscribe(methods => {
      this.paymentMethods = methods;

      this.paymentSettingsService.getPaymentSettings().pipe(
        takeUntil(this.destroy$)
      ).subscribe(settings => {
        if (settings.defaultPaymentMethod && methods.some(m => m.id === settings.defaultPaymentMethod)) {
          this.selectedPaymentMethod = settings.defaultPaymentMethod;
        } else if (methods.length > 0) {
          this.selectedPaymentMethod = methods[0].id;
        }
      });
    });
  }

  private loadCartData(): void {
    combineLatest([
      this.cartService.getCartItems(),
      this.cartService.getTotalPrice()
    ]).pipe(
      takeUntil(this.destroy$)
    ).subscribe(([items, total]) => {
      this.cartItems = items;
      this.totalPrice = total;

      if (items.length === 0) {
        this.router.navigate(['/shop']);
      }
    });
  }

  onPaymentMethodChange(methodId: string): void {
    this.selectedPaymentMethod = methodId;
  }

  onSubmit(): void {
    if (this.checkoutForm.valid && this.cartItems.length > 0) {
      this.isLoading = true;

      const orderData: CreateOrderRequest = {
        customerName: String(this.checkoutForm.value.customerName),
        customerEmail: String(this.checkoutForm.value.customerEmail),
        customerPhone: String(this.checkoutForm.value.customerPhone),
        shippingAddress: String(this.checkoutForm.value.shippingAddress),
        city: String(this.checkoutForm.value.city),
        postalCode: String(this.checkoutForm.value.postalCode),
        country: String(this.checkoutForm.value.country),
        notes: String(this.checkoutForm.value.notes),
        items: this.cartItems.map(item => ({
          productId: Number(item.productId),
          name: String(item.name),
          quantity: Number(item.quantity),
          price: Number(item.price),
          imageUrl: String(item.imageUrl)
        })),
        totalAmount: Number(this.totalPrice),
        paymentMethod: this.selectedPaymentMethod
      };

      this.cartService.createOrder(orderData).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: (order: Order) => {
          this.isLoading = false;
          this.notificationService.showSuccess(this.translate.instant('CHECKOUT.ERRORS.ORDER_SUCCESS'));
          localStorage.setItem(`order_${order.id}`, JSON.stringify(orderData));
          this.router.navigate(['/payment', order.id]);
        },
        error: () => {
          this.isLoading = false;
          this.notificationService.showError(this.translate.instant('CHECKOUT.ERRORS.ORDER_FAILED'));
        }
      });
    } else {
      this.checkoutForm.markAllAsTouched();
      this.notificationService.showError(this.translate.instant('CHECKOUT.ERRORS.FILL_REQUIRED'));
    }
  }

  goBackToCart(): void {
    this.openCartModal();
  }

  openCartModal(): void {
    this.modalService.openModal({
      id: 'cart-modal',
      type: 'cart',
      data: null,
      options: {
        closeOnBackdrop: true,
        closeOnEscape: true,
        showCloseButton: true
      }
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.checkoutForm.get(fieldName);
    if (field?.errors && field?.touched) {
      if (field.errors['required']) return this.translate.instant('CHECKOUT.ERRORS.REQUIRED');
      if (field.errors['email']) return this.translate.instant('CHECKOUT.ERRORS.INVALID_EMAIL');
      if (field.errors['minlength']) {
        return this.translate.instant('CHECKOUT.ERRORS.MIN_LENGTH', {
          requiredLength: field.errors['minlength'].requiredLength
        });
      }
      if (field.errors['pattern']) return this.translate.instant('CHECKOUT.ERRORS.INVALID_FORMAT');
    }
    return '';
  }
}
