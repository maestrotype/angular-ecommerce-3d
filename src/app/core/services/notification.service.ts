import { Injectable } from '@angular/core';
import { ModalService } from './modal.service';
import { NotificationData } from '../../shared/modal/notification-modal/notification-modal.component';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  constructor(private modalService: ModalService) {}

  showSuccess(message: string, autoClose: number = 5000): void {
    this.showNotification({
      message,
      type: 'success'
    }, autoClose);
  }

  showError(message: string, autoClose: number = 8000): void {
    this.showNotification({
      message,
      type: 'error'
    }, autoClose);
  }

  showWarning(message: string, autoClose: number = 6000): void {
    this.showNotification({
      message,
      type: 'warning'
    }, autoClose);
  }

  showInfo(message: string, autoClose: number = 5000): void {
    this.showNotification({
      message,
      type: 'info'
    }, autoClose);
  }

  private showNotification(data: NotificationData, autoClose: number): void {
    const modalId = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    this.modalService.openModal({
      id: modalId,
      type: 'notification',
      data,
      options: {
        closeOnBackdrop: true,
        closeOnEscape: true,
        showCloseButton: true,
        autoClose: autoClose > 0 ? autoClose : 0 // 0 means no auto close
      }
    });

    // Auto close after specified time (only if autoClose > 0)
    if (autoClose > 0) {
      setTimeout(() => {
        this.modalService.closeModal(modalId);
      }, autoClose);
    }
  }
} 