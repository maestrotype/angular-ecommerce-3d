
import { Component, EventEmitter, Output, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../../services/auth.service';
import { NotificationService, Notification } from '../../../services/notification.service';
import { ThemeService } from '../../../../app/core/themes/theme.service';
import { Theme } from '../../../../app/core/themes/theme.model';

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
  currentUser: any = null;
  currentTheme: Theme;

  constructor(
    private router: Router,
    private authService: AuthService,
    private notificationService: NotificationService,
    private translate: TranslateService,
    private themeService: ThemeService
  ) {}

  ngOnInit() {
    this.loadCurrentUser();
    
    // Initialize theme
    this.currentTheme = this.themeService.getCurrentTheme();
    
    // Subscribe to theme changes
    this.themeService.currentTheme$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(theme => {
      this.currentTheme = theme;
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

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCurrentUser() {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.currentUser = user;
    }
  }

  toggleTheme(): void {
    const currentThemeId = this.currentTheme.id;
    let newThemeId: string;
    
    // Cycle through themes: dark -> default -> glass -> dark
    switch (currentThemeId) {
      case 'dark':
        newThemeId = 'default';
        break;
      case 'default':
        newThemeId = 'glass';
        break;
      case 'glass':
        newThemeId = 'dark';
        break;
      default:
        newThemeId = 'dark';
    }
    
    this.themeService.setTheme(newThemeId);
  }

  getThemeIcon(): string {
    switch (this.currentTheme?.id) {
      case 'dark':
        return 'light_mode';
      case 'default':
        return 'blur_on';
      case 'glass':
        return 'dark_mode';
      default:
        return 'light_mode';
    }
  }

  getThemeTooltip(): string {
    switch (this.currentTheme?.id) {
      case 'dark':
        return 'SWITCH_TO_LIGHT';
      case 'default':
        return 'SWITCH_TO_GLASS';
      case 'glass':
        return 'SWITCH_TO_DARK';
      default:
        return 'SWITCH_TO_LIGHT';
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

  logout() {
    this.authService.logout();
    this.router.navigate(['/admin/login']);
  }

  switchLanguage(language: string) {
    this.translate.use(language);
    localStorage.setItem('adminLang', language);
  }
}

