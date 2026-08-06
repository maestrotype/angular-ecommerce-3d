import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-payment-success',
  templateUrl: './payment-success.component.html',
  styleUrls: ['./payment-success.component.scss']
})
export class PaymentSuccessComponent implements OnInit {
  orderId: string | null = null;
  amount: number | null = null;
  paymentMethod: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPaymentData();
  }

  private loadPaymentData(): void {
    this.orderId = this.route.snapshot.queryParamMap.get('orderId');
    const amountStr = this.route.snapshot.queryParamMap.get('amount');
    this.amount = amountStr ? parseFloat(amountStr) : null;
    this.paymentMethod = this.route.snapshot.queryParamMap.get('paymentMethod');

    if (!this.orderId) {
      const orderData = localStorage.getItem('lastPayment');
      if (orderData) {
        const data = JSON.parse(orderData);
        this.orderId = data.orderId;
        this.amount = data.amount;
        this.paymentMethod = data.paymentMethod;
      }
    }
  }

  continueShopping(): void {
    this.router.navigate(['/shop']);
  }

  viewOrderDetails(): void {
    if (this.orderId) {
      this.router.navigate(['/admin/orders'], { queryParams: { orderId: this.orderId } });
    }
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }
}
