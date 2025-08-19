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
import { ThemeService } from '../../core/themes/theme.service';

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
  
  paymentMethods = [
    { id: 'liqpay', name: 'LiqPay', icon: 'credit_card', description: 'Secure online payment' },
    { id: 'stripe', name: 'Stripe', icon: 'payment', description: 'Credit card payment' },
    { id: 'paypal', name: 'PayPal', icon: 'account_balance_wallet', description: 'Pay with PayPal' }
  ];
  
  selectedPaymentMethod = 'liqpay';
  currentTheme = 'default';

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private router: Router,
    private notificationService: NotificationService,
    private modalService: ModalService,
    private themeService: ThemeService
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
    this.loadTheme();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadTheme(): void {
    this.themeService.currentTheme$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(theme => {
      this.currentTheme = theme.id;
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
          this.notificationService.showSuccess('Order created successfully!');
          
          // Store order data for payment page
          localStorage.setItem(`order_${order.id}`, JSON.stringify(orderData));
          
          // Redirect to payment page
          this.router.navigate(['/payment', order.id]);
        },
        error: (error) => {
          this.isLoading = false;
          this.notificationService.showError('Failed to create order. Please try again.');
        }
      });
    } else {
      this.notificationService.showError('Please fill in all required fields.');
    }
  }

  goBackToCart(): void {
    this.router.navigate(['/shop']);
  }

  getThemeClass(baseClass: string): string {
    return `${baseClass} ${this.currentTheme}-theme`;
  }

  getFieldError(fieldName: string): string {
    const field = this.checkoutForm.get(fieldName);
    if (field?.errors && field?.touched) {
      if (field.errors['required']) return 'This field is required';
      if (field.errors['email']) return 'Please enter a valid email';
      if (field.errors['minlength']) return `Minimum length is ${field.errors['minlength'].requiredLength} characters`;
      if (field.errors['pattern']) return 'Please enter a valid format';
    }
    return '';
  }
} 