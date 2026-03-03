import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { loadStripe, Stripe, StripeElements, StripeCardElement } from '@stripe/stripe-js';
import { environment } from '../../../../environments/environment';
import { Observable, from, of, timer, Subject } from 'rxjs';
import { map, catchError, switchMap, takeUntil } from 'rxjs/operators';

export interface StripePaymentData {
  paymentMethodId: string;
  amount: number;
  currency: string;
}

@Component({
  selector: 'app-stripe-elements',
  templateUrl: './stripe-elements.component.html',
  styleUrls: ['./stripe-elements.component.scss']
})
export class StripeElementsComponent implements OnInit, OnDestroy {
  @Input() amount: number = 0;
  @Input() currency: string = 'usd';
  @Input() publishableKey: string = '';
  @Input() clientSecret: string = '';
  @Output() paymentSuccess = new EventEmitter<StripePaymentData>();
  @Output() paymentError = new EventEmitter<string>();
  @Output() loadingChange = new EventEmitter<boolean>();

  @ViewChild('cardElement', { static: true }) cardElement!: ElementRef;

  private destroy$ = new Subject<void>();

  private stripe: Stripe | null = null;
  private elements: StripeElements | null = null;
  private card: StripeCardElement | null = null;

  isLoading = false;
  errorMessage = '';

  ngOnInit() {
    // Wait for DOM to be ready using RxJS timer
    timer(100).pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.initializeStripe();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.card) {
      this.card.destroy();
    }
  }

  private initializeStripe(): void {
    this.setLoading(true);



    if (!this.publishableKey || this.publishableKey === 'pk_test_51Oq...') {
      this.paymentError.emit('Valid Stripe publishable key is required. Please configure it in admin settings.');
      this.setLoading(false);
      return;
    }

    // Load Stripe using RxJS
    from(loadStripe(this.publishableKey)).pipe(
      takeUntil(this.destroy$),
      switchMap(stripe => {
        if (!stripe) {
          throw new Error('Failed to load Stripe');
        }
        this.stripe = stripe;

        // Wait for DOM to be ready using RxJS timer
        return timer(100);
      }),
      map(() => {
        // Create Elements
        this.elements = this.stripe!.elements({
          clientSecret: this.clientSecret || undefined, // Use clientSecret if provided
          appearance: {
            theme: 'stripe',
            variables: {
              colorPrimary: '#3f51b5',
              colorBackground: '#ffffff',
              colorText: '#30313d',
              colorDanger: '#df1b41',
              fontFamily: 'Roboto, sans-serif',
              spacingUnit: '4px',
              borderRadius: '4px'
            }
          }
        });

        // Create card element
        this.card = this.elements!.create('card', {
          style: {
            base: {
              fontSize: '16px',
              color: '#424770',
              '::placeholder': {
                color: '#aab7c4',
              },
            },
            invalid: {
              color: '#9e2146',
            },
          },
        });

        // Mount card element
        if (this.cardElement && this.cardElement.nativeElement) {

          this.card!.mount(this.cardElement.nativeElement);

        } else {
          throw new Error('Card element DOM not ready');
        }

        // Handle validation errors
        this.card!.on('change', (event: any) => {
          if (event.error) {
            this.errorMessage = event.error.message;
          } else {
            this.errorMessage = '';
          }
        });

        this.setLoading(false);
      }),
      catchError(error => {
        this.setLoading(false);
        const errorMessage = `Failed to initialize Stripe: ${error}`;
        this.paymentError.emit(errorMessage);
        return of(null);
      })
    ).subscribe();
  }

  async handlePayment() {
    if (!this.stripe || !this.elements || !this.card || !this.cardElement?.nativeElement) {
      this.paymentError.emit('Stripe not initialized or DOM not ready');
      return;
    }

    try {
      this.setLoading(true);
      this.errorMessage = '';

      // Create payment method
      const { error, paymentMethod } = await this.stripe.createPaymentMethod({
        type: 'card',
        card: this.card,
      } as any);

      if (error) {
        this.errorMessage = error.message || 'Payment failed';
        this.paymentError.emit(this.errorMessage);
        this.setLoading(false);
        return;
      }

      if (paymentMethod) {
        // Emit success with payment method ID
        this.paymentSuccess.emit({
          paymentMethodId: paymentMethod.id,
          amount: this.amount,
          currency: this.currency
        });
      }

      this.setLoading(false);
    } catch (error) {
      this.setLoading(false);
      this.errorMessage = 'An unexpected error occurred';
      this.paymentError.emit(this.errorMessage);
    }
  }

  private setLoading(loading: boolean) {
    this.isLoading = loading;
    this.loadingChange.emit(loading);
  }

  // Public method to clear errors
  clearError() {
    this.errorMessage = '';
  }

  // Public method to reset form
  reset() {
    if (this.card && this.cardElement?.nativeElement) {
      this.card.clear();
    }
    this.errorMessage = '';
  }

  // Public method to check if component is ready
  isReady(): boolean {
    return !!this.card && !!this.stripe;
  }

  // Public getter for card element
  get isCardReady(): boolean {
    return !!this.card;
  }

  // Public getter for stripe instance
  get isStripeReady(): boolean {
    return !!this.stripe;
  }
} 