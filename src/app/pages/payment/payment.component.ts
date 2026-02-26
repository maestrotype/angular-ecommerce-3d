import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil, interval, Observable, of, from, throwError } from 'rxjs';
import { map, switchMap, catchError, tap, delay } from 'rxjs/operators';
import { environment } from '../../../environments/environment.prod';
import { PaymentService } from '../../core/services/payment.service';
import { NotificationService } from '../../core/services/notification.service';
import { ModalService } from '../../core/services/modal.service';
import { ThemeService } from '../../core/themes/theme.service';
import { Payment, PaymentStatus, PaymentRequest } from '../../../shared/models/payment.model';
import { Order } from '../../../shared/models/order.model';
import { PaymentSettingsService } from '../../core/services/payment-settings.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  orderId: number;
  order: Order;
  payment: Payment;
  isLoading = false;
  paymentStatus: PaymentStatus;
  currentTheme = 'default';
  selectedMethod: 'liqpay' | 'stripe' | 'paypal' = 'liqpay';
  stripe: any = null;
  elements: any = null;
  cardEl: any = null;

  // LiqPay specific
  liqpayData: any;
  liqpaySignature: any;

  // Payment status tracking
  statusCheckInterval: any;
  maxStatusChecks = 30; // 5 minutes with 10-second intervals
  statusCheckCount = 0;

  // Stripe configuration
  stripePublishableKey = '';
  stripeClientSecret = '';

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private paymentService: PaymentService,
    private notificationService: NotificationService,
    private modalService: ModalService,
    private themeService: ThemeService,
    private paymentSettingsService: PaymentSettingsService,
    private translate: TranslateService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit(): void {
    this.loadTheme();
    this.loadOrderData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.statusCheckInterval) {
      clearInterval(this.statusCheckInterval);
    }
  }

  private loadTheme(): void {
    this.themeService.currentTheme$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(theme => {
      this.currentTheme = theme.id;
    });
  }

  private loadOrderData(): void {
    this.route.params.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      this.orderId = +params['id'];
      if (this.orderId) {
        const orderData = this.getOrderData();
        // Debug log

        if (orderData?.paymentMethod) {
          this.selectedMethod = orderData.paymentMethod;
        }

        // Check if selected payment method is enabled
        this.paymentSettingsService.getPaymentSettings().pipe(
          takeUntil(this.destroy$)
        ).subscribe(settings => {
          // Store Stripe publishable key
          this.stripePublishableKey = settings.stripePublishableKey;

          if (this.selectedMethod === 'liqpay' && settings.liqpayEnabled) {
            this.createPayment();
          } else if (this.selectedMethod === 'stripe' && settings.stripeEnabled) {
            // For Stripe, we wait for user to click "Initialize Stripe Payment"

            this.notificationService.showInfo(this.translate.instant('PAYMENT.ACTIONS.INIT_STRIPE_PROMPT'));
          } else if (this.selectedMethod === 'paypal' && settings.paypalEnabled) {
            const orderAmount = orderData?.totalAmount || 0;
            this.notificationService.showInfo(this.translate.instant('PAYMENT.ACTIONS.CREATING_PAYPAL'));
            this.paymentService.createPayPalPayment({
              orderId: this.orderId,
              amount: orderAmount,
              currency: 'USD', // Ensure uppercase to match backend enum
              description: `Order #${this.orderId}`
            }).pipe(takeUntil(this.destroy$)).subscribe({
              next: (paypalData) => {
                this.handlePayPalPayment(paypalData);
              },
              error: () => { }
            });
          } else {
            this.notificationService.showWarning(this.translate.instant('PAYMENT.ERRORS.METHOD_NOT_ENABLED', { method: this.selectedMethod }));
          }
        });
      } else {
        this.notificationService.showError(this.translate.instant('PAYMENT.ERRORS.INVALID_ORDER_ID'));
        this.router.navigate(['/shop']);
      }
    });
  }

  private initStripe(clientSecret: string): Observable<void> {
    try {
      const publishableKey = environment.stripePublishableKey || '';

      if (!this.stripe) {
        if (!publishableKey || publishableKey.includes('mock')) {
          // Mock mode - create fake Stripe instance

          this.stripe = {
            elements: () => ({
              create: (type: string) => ({
                mount: (element: HTMLElement) => {

                  element.innerHTML = '<div style="padding: 12px; border: 1px solid #ddd; background: #f9f9f9; color: #666;">Mock Stripe Card Element (Test Mode)</div>';
                }
              })
            }),
            confirmCardPayment: (secret: string, options: any) => {

              // Simulate successful payment after 2 seconds
              return of({
                error: null,
                paymentIntent: {
                  id: 'pi_mock_' + Date.now(),
                  status: 'succeeded'
                }
              }).pipe(delay(2000));
            }
          } as any;
        } else {
          return this.loadStripeJs().pipe(
            tap(() => {
              if (isPlatformBrowser(this.platformId) && (window as any).Stripe) {
                this.stripe = (window as any).Stripe(publishableKey);
              } else {
                this.notificationService.showError(this.translate.instant('PAYMENT.ERRORS.STRIPE_LOAD_FAILED'));
                return;
              }
            }),
            switchMap(() => this.mountCardElements())
          );
        }
      }

      if (!this.stripe) {
        this.notificationService.showError(this.translate.instant('PAYMENT.ERRORS.STRIPE_INIT_FAILED'));
        return of(void 0);
      }

      // Store clientSecret for confirm step
      (this as any)._stripeClientSecret = clientSecret;

      return this.mountCardElements();
    } catch (error) {

      return throwError(() => error);
    }
  }

  private mountCardElements(): Observable<void> {
    // Wait for DOM to be ready before mounting Stripe Elements
    return of(void 0).pipe(
      delay(100),
      tap(() => {
        // Create Elements and mount card
        this.elements = this.stripe.elements();
        if (!this.cardEl) {
          this.cardEl = this.elements.create('card');

          // Try multiple times to find the mount point
          let mountPoint = null;
          let attempts = 0;
          const maxAttempts = 10;

          const tryMount = () => {
            mountPoint = document.getElementById('card-element');
            if (!mountPoint && attempts < maxAttempts) {

              attempts++;
              setTimeout(tryMount, 200);
            } else if (mountPoint) {
              this.cardEl.mount(mountPoint);

            } else {

            }
          };

          tryMount();
        }
      }),
      tap(() => {
        if (environment.stripePublishableKey?.includes('mock')) {
          this.notificationService.showSuccess(this.translate.instant('PAYMENT.NOTIFICATIONS.MOCK_STRIPE_LOADED'));
        } else {
          this.notificationService.showSuccess(this.translate.instant('PAYMENT.NOTIFICATIONS.STRIPE_LOADED'));
        }
      }),
      map(() => void 0)
    );
  }

  confirmStripePayment(): Observable<void> {
    if (!this.stripe || !(this as any)._stripeClientSecret || !this.cardEl) {
      this.notificationService.showError(this.translate.instant('PAYMENT.ERRORS.STRIPE_NOT_READY'));
      return of(void 0);
    }

    const clientSecret = (this as any)._stripeClientSecret as string;


    return from(this.stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: this.cardEl }
    })).pipe(
      tap(({ error, paymentIntent }) => {
        if (error) {

          this.notificationService.showError(error.message || this.translate.instant('PAYMENT.ERRORS.CONFIRM_FAILED'));
          return;
        }

        if (paymentIntent && paymentIntent.status === 'succeeded') {


          // Create payment record in database
          this.createStripePaymentRecord(paymentIntent.id);

          this.notificationService.showSuccess(this.translate.instant('PAYMENT.STATUS.SUCCESS_MSG'));
          setTimeout(() => {
            this.router.navigate(['/payment-success', this.orderId]);
          }, 2000);
        } else {

          this.notificationService.showInfo(this.translate.instant('PAYMENT.STATUS.IN_PROGRESS'));
        }
      }),
      catchError(error => {

        this.notificationService.showError(this.translate.instant('PAYMENT.ERRORS.CONFIRM_FAILED'));
        return of(void 0);
      }),
      map(() => void 0)
    );
  }

  onStripePaymentClick(): void {
    this.isLoading = true;
    this.confirmStripePayment().subscribe({
      next: () => {
        this.isLoading = false;
      },
      error: (error) => {

        this.isLoading = false;
        this.notificationService.showError(this.translate.instant('PAYMENT.ERRORS.CONFIRM_FAILED'));
      }
    });
  }

  private loadStripeJs(): Observable<void> {
    if (document.getElementById('stripe-js')) {
      return of(void 0);
    }

    return new Observable(observer => {
      const script = document.createElement('script');
      script.id = 'stripe-js';
      script.src = 'https://js.stripe.com/v3/';
      script.async = true;
      script.onload = () => {
        observer.next();
        observer.complete();
      };
      script.onerror = () => observer.error(new Error('Stripe.js load error'));
      document.body.appendChild(script);
    });
  }

  private createPayment(): void {
    this.isLoading = true;

    // Get order data from localStorage or route state
    const orderData = this.getOrderData();
    if (!orderData) {
      this.notificationService.showError(this.translate.instant('PAYMENT.ERRORS.ORDER_DATA_NOT_FOUND'));
      this.router.navigate(['/shop']);
      return;
    }

    const paymentRequest: PaymentRequest = {
      orderId: this.orderId,
      amount: orderData.totalAmount,
      currency: 'USD', // Ensure uppercase to match backend enum
      paymentMethod: this.selectedMethod,
      customerEmail: orderData.customerEmail,
      customerPhone: orderData.customerPhone,
      description: `Payment for order #${this.orderId}`
    };

    this.paymentService.createPayment(paymentRequest).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (response?.success && response?.data?.data && response?.data?.signature) {
          // Auto-submit LiqPay checkout form
          this.submitLiqPayForm(response.data.data, response.data.signature);
        } else if (response.payment) {
          this.payment = response.payment;
          this.startStatusTracking();
        } else {
          this.notificationService.showError(response.message || this.translate.instant('PAYMENT.ERRORS.CREATION_FAILED'));
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.notificationService.showError(this.translate.instant('PAYMENT.ERRORS.CREATION_FAILED'));

      }
    });
  }

  private submitLiqPayForm(dataBase64: string, signature: string): void {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://www.liqpay.ua/api/3/checkout';

    const dataInput = document.createElement('input');
    dataInput.type = 'hidden';
    dataInput.name = 'data';
    dataInput.value = String(dataBase64);
    form.appendChild(dataInput);

    const signatureInput = document.createElement('input');
    signatureInput.type = 'hidden';
    signatureInput.name = 'signature';
    signatureInput.value = String(signature);
    form.appendChild(signatureInput);

    document.body.appendChild(form);
    form.submit();
  }

  private getOrderData(): any {
    // Try to get from route state first
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      return navigation.extras.state['orderData'];
    }

    // Fallback to localStorage (browser only)
    if (isPlatformBrowser(this.platformId)) {
      const storedOrder = localStorage.getItem(`order_${this.orderId}`);
      if (storedOrder) {
        return JSON.parse(storedOrder);
      }
    }

    // Fallback for testing - create mock order data

    return {
      totalAmount: 33.00, // Mock amount for testing
      paymentMethod: 'stripe',
      customerEmail: 'test@example.com',
      customerPhone: '+1234567890'
    };
  }

  private startStatusTracking(): void {
    if (!this.payment) return;

    this.statusCheckInterval = setInterval(() => {
      this.checkPaymentStatus();
    }, 10000); // Check every 10 seconds
  }

  private checkPaymentStatus(): void {
    if (this.statusCheckCount >= this.maxStatusChecks) {
      clearInterval(this.statusCheckInterval);
      this.notificationService.showWarning(this.translate.instant('PAYMENT.ERRORS.STATUS_TIMEOUT'));
      return;
    }

    this.statusCheckCount++;

    this.paymentService.getPaymentStatus(this.payment.id).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (status: PaymentStatus) => {
        this.paymentStatus = status;

        if (status === PaymentStatus.COMPLETED) {
          this.handlePaymentSuccess();
        } else if (status === PaymentStatus.FAILED) {
          this.handlePaymentFailure();
        }
      },
      error: (error) => {

      }
    });
  }

  private handlePaymentSuccess(): void {
    clearInterval(this.statusCheckInterval);
    this.notificationService.showSuccess(this.translate.instant('PAYMENT.STATUS.COMPLETED_SUCCESS'));

    // Redirect to success page or order confirmation
    setTimeout(() => {
      this.router.navigate(['/payment-success', this.orderId]);
    }, 2000);
  }

  private handlePaymentFailure(): void {
    clearInterval(this.statusCheckInterval);
    this.notificationService.showError(this.translate.instant('PAYMENT.ERRORS.FAILED_MSG'));

    // Redirect back to checkout
    setTimeout(() => {
      this.router.navigate(['/checkout']);
    }, 3000);
  }

  retryPayment(): void {
    this.createPayment();
  }

  cancelPayment(): void {
    if (this.statusCheckInterval) {
      clearInterval(this.statusCheckInterval);
    }

    this.modalService.openNotification({
      title: this.translate.instant('PAYMENT.MODALS.CANCEL_TITLE'),
      message: this.translate.instant('PAYMENT.MODALS.CANCEL_MSG'),
      type: 'warning',
      action: this.translate.instant('PAYMENT.MODALS.CANCEL_ACTION'),
      actionCallback: () => {
        this.router.navigate(['/checkout']);
      }
    });
  }

  getThemeClass(baseClass: string): string {
    return `${baseClass} ${this.currentTheme}-theme`;
  }

  goBackToCheckout(): void {
    this.router.navigate(['/checkout']);
  }

  private handlePayPalPayment(paypalData: { approvalUrl: string; orderId: string }): void {


    // Redirect user to PayPal for payment approval
    if (paypalData.approvalUrl) {
      this.notificationService.showInfo(this.translate.instant('PAYMENT.ACTIONS.REDIRECTING_PAYPAL'));

      // Store payment info for status tracking
      this.payment = {
        id: 0, // Will be updated when payment is processed
        orderId: Number(paypalData.orderId),
        amount: this.order?.totalAmount || 0,
        currency: 'USD',
        paymentMethod: 'paypal',
        status: 'pending',
        description: `Order #${paypalData.orderId}`,
        customerEmail: '', // Will be filled from order data
        customerPhone: '', // Will be filled from order data
        createdAt: new Date(),
        updatedAt: new Date()
      } as Payment;

      // Start status tracking
      this.startStatusTracking();

      // Redirect to PayPal
      setTimeout(() => {
        if (isPlatformBrowser(this.platformId)) {
          window.location.href = paypalData.approvalUrl;
        }
      }, 1000);
    } else {
      this.notificationService.showError(this.translate.instant('PAYMENT.ERRORS.PAYPAL_URL_FAILED'));
    }
  }

  // Stripe Elements integration methods
  getOrderTotal(): number {
    const orderData = this.getOrderData();
    return orderData?.totalAmount || 0;
  }

  getStripePublishableKey(): string {
    const key = this.stripePublishableKey;


    if (!key) {

      return 'pk_test_51Oq...'; // Fallback for testing
    }

    return key;
  }

  onStripePaymentSuccess(paymentData: any): void {


    // Create payment record
    this.payment = {
      id: 0,
      orderId: this.orderId,
      amount: paymentData.amount,
      currency: paymentData.currency.toUpperCase(),
      paymentMethod: 'stripe',
      status: 'pending',
      description: `Order #${this.orderId}`,
      customerEmail: '',
      customerPhone: '',
      createdAt: new Date(),
      updatedAt: new Date()
    } as Payment;

    // Start status tracking
    this.startStatusTracking();

    this.notificationService.showSuccess(this.translate.instant('PAYMENT.STATUS.STRIPE_METHOD_SUCCESS'));
  }

  onStripePaymentError(errorMessage: string): void {

    this.notificationService.showError(this.translate.instant('PAYMENT.ERRORS.STRIPE_PAYMENT_FAILED', { error: errorMessage }));
  }

  onStripeLoadingChange(isLoading: boolean): void {
    // Update loading state for Stripe specifically

  }

  // Create Stripe payment record in database
  private createStripePaymentRecord(stripePaymentId: string): void {
    const orderData = this.getOrderData();
    if (!orderData) {

      return;
    }

    const paymentRequest: PaymentRequest = {
      orderId: this.orderId,
      amount: orderData.totalAmount,
      currency: 'USD',
      paymentMethod: 'stripe',
      customerEmail: orderData.customerEmail,
      customerPhone: orderData.customerPhone,
      description: `Stripe payment for order #${this.orderId}`
    };

    this.paymentService.createPayment(paymentRequest).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response: any) => {


        // Update payment status to COMPLETED after successful Stripe payment
        if (response?.payment?.id) {
          this.updatePaymentStatusToCompleted(response.payment.id);
        }
      },
      error: (error) => {

      }
    });
  }

  // Update payment status to completed
  private updatePaymentStatusToCompleted(paymentId: number): void {
    this.paymentService.updatePaymentStatus(paymentId, 'completed').pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (updatedPayment) => {

      },
      error: (error) => {

      }
    });
  }

  // Create Stripe PaymentIntent when Stripe is selected
  createStripePaymentIntent(): void {
    if (this.selectedMethod !== 'stripe') return;

    // Check minimum amount for Stripe
    const orderTotal = this.getOrderTotal();
    const minAmount = 0.50; // $0.50 minimum for USD


    if (orderTotal < minAmount) {
      this.notificationService.showError(this.translate.instant('PAYMENT.ERRORS.MIN_AMOUNT', { amount: orderTotal, min: minAmount }));
      return;
    }

    this.isLoading = true;
    this.notificationService.showInfo(this.translate.instant('PAYMENT.ACTIONS.CREATING_STRIPE_INTENT'));

    this.paymentService.createStripeIntent({
      orderId: this.orderId,
      amount: orderTotal,
      currency: 'USD',
      description: `Order #${this.orderId}`
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (clientSecret) => {
        this.stripeClientSecret = clientSecret;
        this.isLoading = false;
        this.notificationService.showSuccess(this.translate.instant('PAYMENT.STATUS.STRIPE_INTENT_SUCCESS'));

        // Initialize Stripe Elements after getting client secret
        this.initStripe(clientSecret).subscribe({
          next: () => this.notificationService.showSuccess(this.translate.instant('PAYMENT.STATUS.STRIPE_INIT_SUCCESS')),
          error: (error) => this.notificationService.showError(this.translate.instant('PAYMENT.ERRORS.STRIPE_INIT_FAILED') + ': ' + error.message)
        });
      },
      error: (error) => {
        this.isLoading = false;
        this.notificationService.showError(this.translate.instant('PAYMENT.ERRORS.STRIPE_INTENT_FAILED') + ': ' + error);

      }
    });
  }
}
