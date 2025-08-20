import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil, interval } from 'rxjs';
import { environment } from '../../../environments/environment.prod';
import { PaymentService } from '../../core/services/payment.service';
import { NotificationService } from '../../core/services/notification.service';
import { ModalService } from '../../core/services/modal.service';
import { ThemeService } from '../../core/themes/theme.service';
import { Payment, PaymentStatus, PaymentRequest } from '../../../shared/models/payment.model';
import { Order } from '../../../shared/models/order.model';

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

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private paymentService: PaymentService,
    private notificationService: NotificationService,
    private modalService: ModalService,
    private themeService: ThemeService
  ) {}

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
        if (orderData?.paymentMethod) {
          this.selectedMethod = orderData.paymentMethod;
        }
        if (this.selectedMethod === 'liqpay') {
          this.createPayment();
        } else if (this.selectedMethod === 'stripe') {
          this.notificationService.showInfo('Creating Stripe PaymentIntent...');
          this.paymentService.createStripeIntent({
            orderId: this.orderId,
            amount: orderData.totalAmount,
            currency: 'USD', // Ensure uppercase to match backend enum
            description: `Order #${this.orderId}`
          }).pipe(takeUntil(this.destroy$)).subscribe({
            next: (clientSecret) => {
              this.initStripe(clientSecret);
            },
            error: () => {}
          });
        } else if (this.selectedMethod === 'paypal') {
          this.notificationService.showInfo('Creating PayPal payment...');
          this.paymentService.createPayPalPayment({
            orderId: this.orderId,
            amount: orderData.totalAmount,
            currency: 'USD', // Ensure uppercase to match backend enum
            description: `Order #${this.orderId}`
          }).pipe(takeUntil(this.destroy$)).subscribe({
            next: (paypalData) => {
              this.handlePayPalPayment(paypalData);
            },
            error: () => {}
          });
        } else {
          this.notificationService.showWarning(`Payment method ${this.selectedMethod} is not enabled yet.`);
        }
      } else {
        this.notificationService.showError('Invalid order ID');
        this.router.navigate(['/shop']);
      }
    });
  }

  private async initStripe(clientSecret: string): Promise<void> {
    try {
      const publishableKey = environment.stripePublishableKey || '';
      
      if (!this.stripe) {
        if (!publishableKey || publishableKey.includes('mock')) {
          // Mock mode - create fake Stripe instance
          console.log('[Stripe] Running in mock mode');
          this.stripe = {
            elements: () => ({
              create: (type: string) => ({
                mount: (element: HTMLElement) => {
                  console.log('[Stripe] Mock card element mounted');
                  element.innerHTML = '<div style="padding: 12px; border: 1px solid #ddd; background: #f9f9f9; color: #666;">Mock Stripe Card Element (Test Mode)</div>';
                }
              })
            }),
            confirmCardPayment: async (secret: string, options: any) => {
              console.log('[Stripe] Mock payment confirmation');
              // Simulate successful payment after 2 seconds
              await new Promise(resolve => setTimeout(resolve, 2000));
              return {
                error: null,
                paymentIntent: {
                  id: 'pi_mock_' + Date.now(),
                  status: 'succeeded'
                }
              };
            }
          } as any;
        } else {
          await this.loadStripeJs();
          if (!(window as any).Stripe) {
            this.notificationService.showError('Stripe.js failed to load.');
            return;
          }
          this.stripe = (window as any).Stripe(publishableKey);
        }
      }
      
      if (!this.stripe) {
        this.notificationService.showError('Failed to initialize Stripe.');
        return;
      }
      
      this.elements = this.stripe.elements();
      if (!this.cardEl) {
        this.cardEl = this.elements.create('card');
        const mountPoint = document.getElementById('card-element');
        if (mountPoint) {
          this.cardEl.mount(mountPoint);
          console.log('[Stripe] Card element mounted successfully');
        } else {
          console.error('[Stripe] Card element mount point not found');
        }
      }
      
      // Store clientSecret for confirm step
      (this as any)._stripeClientSecret = clientSecret;
      
      if (publishableKey.includes('mock')) {
        this.notificationService.showSuccess('Mock Stripe Elements loaded (Test Mode). Click Pay with Card to simulate payment.');
      } else {
        this.notificationService.showSuccess('Stripe Elements loaded. Enter your card details and click Pay with Card.');
      }
    } catch (e) {
      console.error('[Stripe] Initialization error:', e);
      this.notificationService.showError('Failed to load Stripe Elements.');
    }
  }

  async confirmStripePayment(): Promise<void> {
    try {
      if (!this.stripe || !(this as any)._stripeClientSecret || !this.cardEl) {
        this.notificationService.showError('Stripe not ready. Please wait for initialization.');
        return;
      }
      
      const clientSecret = (this as any)._stripeClientSecret as string;
      console.log('[Stripe] Confirming payment with clientSecret:', clientSecret.substring(0, 20) + '...');
      
      const { error, paymentIntent } = await this.stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: this.cardEl }
      });
      
      if (error) {
        console.error('[Stripe] Payment error:', error);
        this.notificationService.showError(error.message || 'Payment failed');
        return;
      }
      
      if (paymentIntent && paymentIntent.status === 'succeeded') {
        console.log('[Stripe] Payment succeeded:', paymentIntent.id);
        this.notificationService.showSuccess('Payment completed successfully!');
        setTimeout(() => {
          this.router.navigate(['/payment-success', this.orderId]);
        }, 2000);
      } else {
        console.log('[Stripe] Payment status:', paymentIntent?.status);
        this.notificationService.showInfo('Payment processing...');
      }
    } catch (e) {
      console.error('[Stripe] Confirm payment error:', e);
      this.notificationService.showError('Payment confirmation failed. Please try again.');
    }
  }

  private loadStripeJs(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (document.getElementById('stripe-js')) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.id = 'stripe-js';
      script.src = 'https://js.stripe.com/v3/';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Stripe.js load error'));
      document.body.appendChild(script);
    });
  }

  private createPayment(): void {
    this.isLoading = true;
    
    // Get order data from localStorage or route state
    const orderData = this.getOrderData();
    if (!orderData) {
      this.notificationService.showError('Order data not found');
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
          this.notificationService.showError(response.message || 'Payment creation failed');
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.notificationService.showError('Failed to create payment. Please try again.');
        console.error('Payment creation error:', error);
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
    
    // Fallback to localStorage
    const storedOrder = localStorage.getItem(`order_${this.orderId}`);
    if (storedOrder) {
      return JSON.parse(storedOrder);
    }
    
    return null;
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
      this.notificationService.showWarning('Payment status check timeout. Please contact support.');
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
        console.error('Error checking payment status:', error);
      }
    });
  }

  private handlePaymentSuccess(): void {
    clearInterval(this.statusCheckInterval);
    this.notificationService.showSuccess('Payment completed successfully!');
    
    // Redirect to success page or order confirmation
    setTimeout(() => {
      this.router.navigate(['/payment-success', this.orderId]);
    }, 2000);
  }

  private handlePaymentFailure(): void {
    clearInterval(this.statusCheckInterval);
    this.notificationService.showError('Payment failed. Please try again.');
    
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
      title: 'Cancel Payment',
      message: 'Are you sure you want to cancel this payment?',
      type: 'warning',
      action: 'Cancel',
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
    console.log('PayPal payment created:', paypalData);
    
    // Redirect user to PayPal for payment approval
    if (paypalData.approvalUrl) {
      this.notificationService.showInfo('Redirecting to PayPal...');
      
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
        window.location.href = paypalData.approvalUrl;
      }, 1000);
    } else {
      this.notificationService.showError('Failed to get PayPal approval URL');
    }
  }
}
