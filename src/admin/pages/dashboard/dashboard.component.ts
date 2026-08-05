import { Component, OnDestroy, OnInit } from '@angular/core';
import { ChartConfiguration, ChartOptions, Chart, registerables } from 'chart.js';
import { Subscription } from 'rxjs';
import { DashboardService } from '../../services/dashboard.service';
import { ErrorHandlerService } from '../../services/error-handler.service';
import { TranslateService } from '@ngx-translate/core';
import { ThemeService } from '../../../app/core/themes/theme.service';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  dashboardData: any = {};
  isLoading = false;
  private themeSub?: Subscription;

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
          callback: (value) => '$' + value
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#475569'
        }
      }
    }
  };

  constructor(
    private dashboardService: DashboardService,
    private errorHandler: ErrorHandlerService,
    private translate: TranslateService,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
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
