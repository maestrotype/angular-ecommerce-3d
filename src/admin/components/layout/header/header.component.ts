import { Component, EventEmitter, Output, OnInit, OnDestroy, ViewEncapsulation, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';
import { AdminAuthService } from '../../../services/auth.service';
import { ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import {
  AdminNotificationService,
  AdminNotification,
} from '../../../services/notification.service';
import { TranslateService } from '@ngx-translate/core';

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
  notifications: AdminNotification[] = [];
   unreadCount = 0;
  currentTheme: string = 'dark';
  isMobile: boolean = false;

  constructor(
    private router: Router,
    private authService: AdminAuthService,
    private notificationService: AdminNotificationService,
    private themeService: ThemeService,
    private translate: TranslateService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit(): void {
    // Sync with ThemeService
    this.themeService.adminTheme$
      .pipe(takeUntil(this.destroy$))
      .subscribe(theme => {
        this.currentTheme = theme.id;
      });

    this.checkScreenSize();
    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('resize', this.checkScreenSize.bind(this));
    }

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
      .subscribe(count => {
        this.unreadCount = count;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('resize', this.checkScreenSize.bind(this));
    }
  }

  private checkScreenSize(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.isMobile = window.innerWidth <= 768;
    }
  }

  toggleTheme(): void {
    this.themeService.toggleAdminTheme();
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

  onNotificationClick(notification: AdminNotification): void {
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

    if (diffMins < 1) return this.translate.instant('TIME.JUST_NOW');
    if (diffMins < 60) return this.translate.instant('TIME.MINUTES_AGO', { minutes: diffMins });
    if (diffHours < 24) return this.translate.instant('TIME.HOURS_AGO', { hours: diffHours });
    return this.translate.instant('TIME.DAYS_AGO', { days: diffDays });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/admin/login']);
  }
}
