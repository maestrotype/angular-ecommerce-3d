import { Component, Input } from '@angular/core';
import { ModalConfig } from '../../../core/services/modal.service';

export interface NotificationData {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  icon?: string;
}

@Component({
  selector: 'app-notification-modal',
  templateUrl: './notification-modal.component.html',
  styleUrls: ['./notification-modal.component.scss']
})
export class NotificationModalComponent {
  @Input() config!: ModalConfig;
  
  get notificationData(): NotificationData {
    return this.config.data || { message: '', type: 'info' };
  }

  get iconClass(): string {
    switch (this.notificationData.type) {
      case 'success':
        return 'fas fa-check-circle';
      case 'error':
        return 'fas fa-exclamation-circle';
      case 'warning':
        return 'fas fa-exclamation-triangle';
      case 'info':
      default:
        return 'fas fa-info-circle';
    }
  }

  get modalClass(): string {
    return `notification-modal ${this.notificationData.type}`;
  }
} 