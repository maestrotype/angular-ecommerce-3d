
import { Component, EventEmitter, Output, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';
import { AuthService } from '../../../services/auth.service';
import { NotificationService, Notification } from '../../../services/notification.service';
import { ThemeService } from '../../../services/theme.service';

@Component({
  selector: 'app-admin-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Output() toggleSidenav = new EventEmitter<void>();
  
  private destroy$ = new Subject<void>();
  notifications: Notification[] = [];
  unreadCount = 0;

  constructor(
    private router: Router,
    private authService: AuthService,
    private notificationService: NotificationService,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.notificationService.loadNotifications()
      .pipe(takeUntil(this.destroy$))
      .subscribe(notifications => {
        this.notifications = notifications.slice(0, 5);
        this.notificationService.updateNotifications(notifications);
      });

    this.notificationService.notifications$
      .pipe(takeUntil(this.destroy$))
      .subscribe(notifications => {
        this.notifications = notifications.slice(0, 5);
      });

    this.notificationService.unreadCount$
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => {
        this.unreadCount = count;
      });

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

  onNotificationClick(notification: Notification): void {
    if (notification.status === 'unread') {
      this.notificationService.markAsRead(notification.id).pipe(
        switchMap(() => this.notificationService.loadNotifications())
      ).subscribe(notifications => {
        this.notificationService.updateNotifications(notifications);
      });
    }

    // Навигация в зависимости от типа уведомления
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

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  getThemeIcon(): string {
    return this.themeService.isDarkTheme() ? 'light_mode' : 'dark_mode';
  }

  getThemeTooltip(): string {
    return this.themeService.isDarkTheme() ? 'Switch to Light Theme' : 'Switch to Dark Theme';
  }
}

