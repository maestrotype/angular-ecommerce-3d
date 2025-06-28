import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ModalConfig {
  id: string;
  type: 'image' | 'cart' | 'auth' | 'custom';
  data?: any;
  options?: {
    closeOnBackdrop?: boolean;
    closeOnEscape?: boolean;
    showCloseButton?: boolean;
    customClass?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private modalStack: ModalConfig[] = [];
  private modalStackSubject = new BehaviorSubject<ModalConfig[]>([]);
  
  public modalStack$ = this.modalStackSubject.asObservable();

  openModal(config: ModalConfig): void {
    const defaultOptions = {
      closeOnBackdrop: true,
      closeOnEscape: true,
      showCloseButton: true,
    };
    
    config.options = { ...defaultOptions, ...config.options };
    
    this.modalStack.push(config);
    this.modalStackSubject.next([...this.modalStack]);
  }

  closeModal(id?: string): void {
    if (id) {
      this.modalStack = this.modalStack.filter(modal => modal.id !== id);
    } else {
      this.modalStack.pop();
    }
    this.modalStackSubject.next([...this.modalStack]);
  }

  closeAllModals(): void {
    this.modalStack = [];
    this.modalStackSubject.next([]);
  }

  isModalOpen(id?: string): boolean {
    if (id) {
      return this.modalStack.some(modal => modal.id === id);
    }
    return this.modalStack.length > 0;
  }

  getTopModal(): ModalConfig | null {
    return this.modalStack.length > 0 ? this.modalStack[this.modalStack.length - 1] : null;
  }
}