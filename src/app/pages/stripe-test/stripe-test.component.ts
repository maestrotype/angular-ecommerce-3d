import { Component } from '@angular/core';
import { StripePaymentData } from '../../shared/components/stripe-elements/stripe-elements.component';

@Component({
  selector: 'app-stripe-test',
  templateUrl: './stripe-test.component.html',
  styleUrls: ['./stripe-test.component.scss']
})
export class StripeTestComponent {
  testAmount = 29.99;
  testCurrency = 'usd';
  testPublishableKey = 'pk_test_51Oq...'; // Replace with your test key

  onPaymentSuccess(paymentData: StripePaymentData): void {
    console.log('Payment successful:', paymentData);
    alert(`Payment successful! Payment Method ID: ${paymentData.paymentMethodId}`);
  }

  onPaymentError(errorMessage: string): void {
    console.error('Payment error:', errorMessage);
    alert(`Payment failed: ${errorMessage}`);
  }

  onLoadingChange(isLoading: boolean): void {
    console.log('Loading state:', isLoading);
  }
} 