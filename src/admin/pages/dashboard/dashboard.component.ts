import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { ChartConfiguration, ChartOptions, Chart, registerables } from 'chart.js';
import { Subscription } from 'rxjs';
import { DashboardService } from '../../services/dashboard.service';
import { ErrorHandlerService } from '../../services/error-handler.service';
import { TranslateService } from '@ngx-translate/core';
import { ThemeService } from '../../../app/core/themes/theme.service';
import { ProductService } from '../../../app/core/services/product.service';
import { Product } from 'src/shared/models/product.model';
import { pickStageProducts, stageModelPath } from 'src/shared/utils/product-stage.util';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  dashboardData: any = {};
  isLoading = false;
  stageProduct: Product | null = null;
  stageAutoRotate = true;
  modelScale: [number, number, number] = [6, 6, 6];
  modelPosition: [number, number, number] = [0, -0.12, 0];
  private themeSub?: Subscription;
  private productsSub?: Subscription;

  public salesChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [1200, 1900, 1700, 2400, 2100, 2800, 3200],
        label: '',
        fill: true,
        tension: 0.4,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#3b82f6',
      }
    ]
  };

  public salesChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: { top: 8, right: 4, bottom: 0, left: 0 }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#18181b',
        titleColor: '#fafafa',
        bodyColor: '#e4e4e7',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (context) => ` $${context.parsed.y}`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(15, 23, 42, 0.08)',
        },
        ticks: {
          color: '#475569',
          maxTicksLimit: 5,
          callback: (value) => {
            const amount = Number(value);
            if (amount >= 1000) {
              return '$' + (amount / 1000).toString().replace(/\.0$/, '') + 'k';
            }
            return '$' + amount;
          }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#475569',
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 7
        }
      }
    }
  };

  constructor(
    private dashboardService: DashboardService,
    private errorHandler: ErrorHandlerService,
    private translate: TranslateService,
    private themeService: ThemeService,
    private productService: ProductService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.stageAutoRotate = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
  }

  ngOnInit(): void {
    this.loadDashboardData();
    this.loadStagePreview();
    this.initChartTranslations();
    this.applyChartAxisColors();

    this.translate.onLangChange.subscribe(() => {
      this.initChartTranslations();
    });

    this.themeSub = this.themeService.adminTheme$.subscribe(() => {
      this.applyChartAxisColors();
    });
  }

  ngOnDestroy(): void {
    this.themeSub?.unsubscribe();
    this.productsSub?.unsubscribe();
  }

  stageModelPath(): string {
    return stageModelPath(this.stageProduct);
  }

  openStageProduct(): void {
    if (!this.stageProduct) {
      return;
    }
    this.router.navigate(['/product', this.stageProduct.id]);
  }

  private loadStagePreview(): void {
    this.productsSub = this.productService.getProducts().subscribe({
      next: (products) => {
        this.stageProduct = pickStageProducts(products, { limit: 1 })[0] || null;
      },
      error: () => {
        this.stageProduct = null;
      },
    });
  }

  /** Glass/dark: bright ticks; light: slate for contrast on pale cards */
  private applyChartAxisColors(): void {
    const theme =
      document.body.getAttribute('data-theme') ||
      document.documentElement.getAttribute('data-theme') ||
      'light';
    const onDarkGlass = theme === 'glass' || theme === 'dark' || theme === 'dark-glass';
    const tick = onDarkGlass ? 'rgba(255, 255, 255, 0.9)' : '#475569';
    const grid = onDarkGlass ? 'rgba(255, 255, 255, 0.14)' : 'rgba(15, 23, 42, 0.08)';

    const y = this.salesChartOptions.scales?.['y'];
    const x = this.salesChartOptions.scales?.['x'];
    if (y && 'ticks' in y && y.ticks) {
      y.ticks.color = tick;
    }
    if (y && 'grid' in y && y.grid) {
      y.grid.color = grid;
    }
    if (x && 'ticks' in x && x.ticks) {
      x.ticks.color = tick;
    }

    this.salesChartOptions = { ...this.salesChartOptions };
  }

  private initChartTranslations(): void {
    const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    this.salesChartData.labels = days.map(day => this.translate.instant('DAYS_SHORT.' + day));
    this.salesChartData.datasets[0].label = this.translate.instant('SALES_ACTIVITY');
    this.salesChartData = { ...this.salesChartData };
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.dashboardService.getDashboardStats().subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.isLoading = false;
      },
      error: () => {
        this.errorHandler.showError({
          title: this.translate.instant('ERROR_TITLE'),
          message: this.translate.instant('FAILED_TO_LOAD_DASHBOARD'),
          type: 'error'
        });
        this.isLoading = false;
      }
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatNumber(num: number): string {
    return new Intl.NumberFormat('en-US').format(num);
  }
}
