import { Injectable } from '@angular/core';
import { ModalService, NotificationData } from './modal.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  constructor(private modalService: ModalService) {}

  showSuccess(message: string, autoClose: number = 3000): void {
    this.showNotification({
      message,
      type: 'success'
    }, autoClose);
  }

  showError(message: string, autoClose: number = 5000): void {
    this.showNotification({
      message,
      type: 'error'
    }, autoClose);
  }

  showWarning(message: string, autoClose: number = 4000): void {
    this.showNotification({
      message,
      type: 'warning'
    }, autoClose);
  }

  showInfo(message: string, autoClose: number = 3000): void {
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
        autoClose
      }
    });

    // Auto close after specified time
    if (autoClose > 0) {
      setTimeout(() => {
        this.modalService.closeModal(modalId);
      }, autoClose);
    }
  }
} 