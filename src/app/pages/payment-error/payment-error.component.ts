import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ThemeService } from '../../core/themes/theme.service';
import { Theme } from '../../core/themes/theme.model';

@Component({
  selector: 'app-payment-error',
  templateUrl: './payment-error.component.html',
  styleUrls: ['./payment-error.component.scss']
})
export class PaymentErrorComponent implements OnInit {
  currentTheme = 'default';
  errorMessage: string = 'Payment processing failed';
  orderId: string | null = null;
  amount: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.loadTheme();
    this.loadErrorData();
  }

  private loadTheme(): void {
    this.themeService.currentTheme$.subscribe((theme: Theme) => {
      this.currentTheme = theme.id;
    });
  }

  private loadErrorData(): void {
    // Get data from route params
    this.errorMessage = this.route.snapshot.queryParamMap.get('error') || 'Payment processing failed';
    this.orderId = this.route.snapshot.queryParamMap.get('orderId');
    const amountStr = this.route.snapshot.queryParamMap.get('amount');
    this.amount = amountStr ? parseFloat(amountStr) : null;

    // Fallback to localStorage if no route params
    if (!this.orderId) {
      const orderData = localStorage.getItem('lastPayment');
      if (orderData) {
        const data = JSON.parse(orderData);
        this.orderId = data.orderId;
        this.amount = data.amount;
      }
    }
  }

  getThemeClass(baseClass: string): string {
    return `${baseClass} ${this.currentTheme}-theme`;
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
    this.router.navigate(['/cart']);
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }
} 