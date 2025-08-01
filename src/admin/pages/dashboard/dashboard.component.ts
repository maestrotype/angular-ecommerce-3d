import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../services/dashboard.service';
import { ErrorHandlerService } from '../../services/error-handler.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  dashboardData: any = {};
  isLoading = false;

  constructor(
    private dashboardService: DashboardService,
    private errorHandler: ErrorHandlerService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
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
          title: 'Error',
          message: 'Failed to load dashboard data',
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