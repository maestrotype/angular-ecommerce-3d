import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-payment-error',
  templateUrl: './payment-error.component.html',
  styleUrls: ['./payment-error.component.scss']
})
export class PaymentErrorComponent implements OnInit {
  errorMessage = '';
  orderId: string | null = null;
  amount: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private translate: TranslateService
  ) { }

  ngOnInit(): void {
    this.loadErrorData();
  }

  private loadErrorData(): void {
    this.errorMessage = this.route.snapshot.queryParamMap.get('error') || this.translate.instant('PAYMENT.ERROR_PAGE.DEFAULT_ERROR');
    this.orderId = this.route.snapshot.queryParamMap.get('orderId');
    const amountStr = this.route.snapshot.queryParamMap.get('amount');
    this.amount = amountStr ? parseFloat(amountStr) : null;

    if (!this.orderId) {
      const orderData = localStorage.getItem('lastPayment');
      if (orderData) {
        const data = JSON.parse(orderData);
        this.orderId = data.orderId;
        this.amount = data.amount;
      }
    }
  }

  tryAgain(): void {
    if (this.orderId) {
      this.router.navigate(['/checkout'], { queryParams: { orderId: this.orderId } });
    } else {
      this.router.navigate(['/checkout']);
    }
  }

  contactSupport(): void {
    this.router.navigate(['/contacts']);
  }

  goToCart(): void {
    this.router.navigate(['/shop']);
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }
}
