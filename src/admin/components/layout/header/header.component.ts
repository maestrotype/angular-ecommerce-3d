
import { Component, EventEmitter, Output, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';
import { AuthService } from '../../../services/auth.service';
import { ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { NotificationService, Notification } from '../../../services/notification.service';
import { ThemeService } from '../../../../app/core/themes/theme.service';

@Component({
  selector: 'app-admin-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Output() toggleSidenav = new EventEmitter<void>();
  @ViewChild('notificationMenuTrigger') notificationMenuTrigger!: MatMenuTrigger;

  private destroy$ = new Subject<void>();
  notifications: Notification[] = [];
  unreadCount = 0;
  currentTheme: string = 'dark';

  constructor(
    private router: Router,
    private authService: AuthService,
    private notificationService: NotificationService,
    private themeService: ThemeService
  ) { }

  ngOnInit(): void {
    // Sync with theme service
    this.themeService.adminTheme$
      .pipe(takeUntil(this.destroy$))
      .subscribe(theme => {
        if (theme) {
          this.currentTheme = theme.id;
        } else {
          // Default to dark if not set
          this.themeService.setTheme('dark', 'admin');
        }
      });

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
    let nextThemeId: string;

    switch (this.currentTheme) {
      case 'dark':
        nextThemeId = 'light';
        break;
      case 'light':
        nextThemeId = 'glass';
        break;
      case 'glass':
        nextThemeId = 'dark-glass';
        break;
      case 'dark-glass':
      default:
        nextThemeId = 'dark';
        break;
    }

    this.themeService.setTheme(nextThemeId, 'admin');
  }

  private applyTheme(): void {
    // Handled by ThemeService
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
    // Close the menu first
    this.closeNotificationMenu();

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
      this.closeNotificationMenu();
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
