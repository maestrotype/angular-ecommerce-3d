import { Component, Input } from '@angular/core';
import { ModalConfig, NotificationData } from '../../../core/services/modal.service';

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

  getIcon(): string {
    switch (this.notificationData.type) {
      case 'success':
        return 'check_circle';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
      default:
        return 'info';
    }
  }

  getIconColor(): string {
    switch (this.notificationData.type) {
      case 'success':
        return '#4caf50';
      case 'error':
        return '#f44336';
      case 'warning':
        return '#ff9800';
      case 'info':
      default:
        return '#2196f3';
    }
  }

  get modalClass(): string {
    return `notification-modal ${this.notificationData.type}`;
  }
} 