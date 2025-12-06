
import { Component, EventEmitter, Output, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';
import { AuthService } from '../../../services/auth.service';
import { ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { NotificationService, Notification } from '../../../services/notification.service';

@Component({
  selector: 'app-admin-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Output() toggleSidenav = new EventEmitter<void>();
  @ViewChild(MatMenuTrigger) notificationMenuTrigger!: MatMenuTrigger;
  
  private destroy$ = new Subject<void>();
  notifications: Notification[] = [];
  unreadCount = 0;
  currentTheme: 'light' | 'dark' | 'glass' | 'dark-glass' = 'dark'; // Default to dark theme

  constructor(
    private router: Router,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    // Load theme preference from localStorage
    const savedTheme = localStorage.getItem('adminTheme') as 'light' | 'dark' | 'glass' | null;
    this.currentTheme = savedTheme || 'dark'; // Default to dark if no saved theme
    this.applyTheme();

    // Load notifications on initialization
    this.notificationService.loadNotifications()
      .pipe(takeUntil(this.destroy$))
      .subscribe(notifications => {
        this.notifications = notifications.slice(0, 5);
        this.notificationService.updateNotifications(notifications);
      });

    // Subscribe to notification changes
    this.notificationService.notifications$
      .pipe(takeUntil(this.destroy$))
      .subscribe(notifications => {
        this.notifications = notifications.slice(0, 5);
      });

    // Subscribe to unread count
    this.notificationService.unreadCount$
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => {
        this.unreadCount = count;
      });

    // Get actual unread count from server
    this.notificationService.getUnreadCount()
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => {
        this.unreadCount = count;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleTheme(): void {
    // Cycle through themes: dark -> light -> glass -> dark-glass -> dark
    if (this.currentTheme === 'dark') {
      this.currentTheme = 'light';
    } else if (this.currentTheme === 'light') {
      this.currentTheme = 'glass';
    } else if (this.currentTheme === 'glass') {
      this.currentTheme = 'dark-glass';
    } else {
      this.currentTheme = 'dark';
    }
    this.applyTheme();
    
    // Save theme preference
    localStorage.setItem('adminTheme', this.currentTheme);
  }

  private applyTheme(): void {
    // Apply theme to documentElement instead of body for consistency with frontend
    document.documentElement.setAttribute('data-theme', this.currentTheme);
  }

  openNotificationMenu(): void {
    if (this.notificationMenuTrigger) {
      this.notificationMenuTrigger.openMenu();
    }
  }

  closeNotificationMenu(): void {
    if (this.notificationMenuTrigger) {
      this.notificationMenuTrigger.closeMenu();
    }
  }

  onNotificationClick(notification: Notification): void {
    if (notification.status === 'unread') {
      this.notificationService.markAsRead(notification.id).pipe(
        switchMap(() => this.notificationService.loadNotifications())
      ).subscribe(notifications => {
        this.notificationService.updateNotifications(notifications);
      });
    }

    // Navigation based on notification type
    switch (notification.type) {
      case 'order_created':
      case 'order_updated':
        this.router.navigate(['/admin/orders']);
        break;
      case 'low_stock':
        this.router.navigate(['/admin/products']);
        break;
      case 'new_user':
        this.router.navigate(['/admin/users']);
        break;
    }
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().pipe(
      switchMap(() => this.notificationService.loadNotifications())
    ).subscribe(notifications => {
      this.notificationService.updateNotifications(notifications);
    });
  }

  getNotificationIcon(type: string): string {
    return this.notificationService.getNotificationIcon(type);
  }

  getNotificationColor(type: string): string {
    return this.notificationService.getNotificationColor(type);
  }

  getRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/admin/login']);
  }
}
