import { Component, OnInit } from '@angular/core';
import { ChartConfiguration, ChartOptions, ChartType, Chart, registerables } from 'chart.js';
import { DashboardService } from '../../services/dashboard.service';
import { ErrorHandlerService } from '../../services/error-handler.service';
import { TranslateService } from '@ngx-translate/core';

// Register Chart.js components
Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  dashboardData: any = {};
  isLoading = false;

  // Chart Properties
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
        bodyColor: '#a1a1aa',
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
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: '#a1a1aa',
          callback: (value) => '$' + value
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#a1a1aa'
        }
      }
    }
  };

  constructor(
    private dashboardService: DashboardService,
    private errorHandler: ErrorHandlerService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
    this.initChartTranslations();
    
    this.translate.onLangChange.subscribe(() => {
      this.initChartTranslations();
    });
  }

  private initChartTranslations(): void {
    const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    this.salesChartData.labels = days.map(day => this.translate.instant('DAYS_SHORT.' + day));
    this.salesChartData.datasets[0].label = this.translate.instant('SALES_ACTIVITY');
    
    // Trigger chart update if necessary
    this.salesChartData = { ...this.salesChartData };
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.dashboardService.getDashboardStats().subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.isLoading = false;
      },
      error: (error) => {
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