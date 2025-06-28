import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { ModalService, ModalConfig } from '../../core/services/modal.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-base-modal',
  templateUrl: './base-modal.component.html',
  styleUrls: ['./base-modal.component.scss']
})
export class BaseModalComponent implements OnInit, OnDestroy {
  modalStack: ModalConfig[] = [];
  private subscription: Subscription = new Subscription();

  constructor(private modalService: ModalService) {}

  ngOnInit(): void {
    this.subscription.add(
      this.modalService.modalStack$.subscribe(stack => {
        this.modalStack = stack;
        this.updateBodyClass();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    document.body.classList.remove('modal-open');
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: KeyboardEvent): void {
    const topModal = this.modalService.getTopModal();
    if (topModal && topModal.options?.closeOnEscape) {
      this.closeTopModal();
    }
  }

  onBackdropClick(modal: ModalConfig): void {
    if (modal.options?.closeOnBackdrop) {
      this.modalService.closeModal(modal.id);
    }
  }

  closeTopModal(): void {
    this.modalService.closeModal();
  }

  closeModal(id: string): void {
    this.modalService.closeModal(id);
  }

  private updateBodyClass(): void {
    if (this.modalStack.length > 0) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
  }

  trackByModalId(index: number, modal: ModalConfig): string {
    return modal.id;
  }
}