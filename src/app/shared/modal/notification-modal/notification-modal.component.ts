import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ModalConfig } from '../../../core/services/modal.service';

export interface NotificationData {
  title: string;
  message: string;
  details?: string;
  type: 'error' | 'warning' | 'info' | 'success';
  action?: string;
  actionCallback?: () => void;
  theme?: 'admin' | 'storefront';
}

@Component({
  selector: 'app-notification-modal',
  templateUrl: './notification-modal.component.html',
  styleUrls: ['./notification-modal.component.scss']
})
export class NotificationModalComponent {
  @Input() config!: ModalConfig;
  @Output() close = new EventEmitter<void>();

  get notificationData(): NotificationData {
    return this.config.data;
  }

  onAction(): void {
    if (this.notificationData.actionCallback) {
      this.notificationData.actionCallback();
    }
    this.close.emit();
  }

  onClose(): void {
    this.close.emit();
  }

  getIcon(): string {
    switch (this.notificationData.type) {
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      case 'success':
        return 'check_circle';
      default:
        return 'error';
    }
  }

  getIconColor(): string {
    const theme = this.notificationData.theme || this.detectTheme();
    const prefix = theme === 'admin' ? '--admin' : '--color';
    
    switch (this.notificationData.type) {
      case 'error':
        return `var(${prefix}-error, #dc3545)`;
      case 'warning':
        return `var(${prefix}-warning, #ffc107)`;
      case 'info':
        return `var(${prefix}-info, #17a2b8)`;
      case 'success':
        return `var(${prefix}-success, #28a745)`;
      default:
        return `var(${prefix}-error, #dc3545)`;
    }
  }

  getModalClass(): string {
    const theme = this.notificationData.theme || this.detectTheme();
    return `notification-modal ${theme}-theme ${this.notificationData.type}-type`;
  }

  private detectTheme(): 'admin' | 'storefront' {
    const currentUrl = window.location.pathname;
    return currentUrl.startsWith('/admin') ? 'admin' : 'storefront';
  }
} 