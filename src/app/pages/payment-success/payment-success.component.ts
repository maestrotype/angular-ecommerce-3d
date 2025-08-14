import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ThemeService } from '../../core/themes/theme.service';
import { Theme } from '../../core/themes/theme.model';

@Component({
  selector: 'app-payment-success',
  templateUrl: './payment-success.component.html',
  styleUrls: ['./payment-success.component.scss']
})
export class PaymentSuccessComponent implements OnInit {
  currentTheme = 'default';
  orderId: string | null = null;
  amount: number | null = null;
  paymentMethod: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.loadTheme();
    this.loadPaymentData();
  }

  private loadTheme(): void {
    this.themeService.currentTheme$.subscribe((theme: Theme) => {
      this.currentTheme = theme.id;
    });
  }

  private loadPaymentData(): void {
    // Get data from route params or localStorage
    this.orderId = this.route.snapshot.queryParamMap.get('orderId');
    const amountStr = this.route.snapshot.queryParamMap.get('amount');
    this.amount = amountStr ? parseFloat(amountStr) : null;
    this.paymentMethod = this.route.snapshot.queryParamMap.get('paymentMethod');

    // Fallback to localStorage if no route params
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

  getThemeClass(baseClass: string): string {
    return `${baseClass} ${this.currentTheme}-theme`;
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