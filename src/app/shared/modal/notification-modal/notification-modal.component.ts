import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ModalConfig, NotificationData } from '../../../core/services/modal.service';

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
    this.onClose();
  }

  onClose(): void {
    this.close.emit();
  }

  getIcon(): string {
    switch (this.notificationData.type) {
      case 'success': return 'check_circle';
      case 'error': return 'error';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'info';
    }
  }

  getIconColor(): string {
    switch (this.notificationData.type) {
      case 'success': return '#28a745';
      case 'error': return '#dc3545';
      case 'warning': return '#ffc107';
      case 'info': return '#17a2b8';
      default: return '#17a2b8';
    }
  }

  getModalClass(): string {
    const theme = this.notificationData.theme || 'storefront';
    return `${theme}-theme ${this.notificationData.type}-type`;
  }

  detectTheme(): 'admin' | 'storefront' {
    if (this.notificationData.theme) {
      return this.notificationData.theme;
    }
    
    const currentUrl = window.location.pathname;
    return currentUrl.startsWith('/admin') ? 'admin' : 'storefront';
  }
} 