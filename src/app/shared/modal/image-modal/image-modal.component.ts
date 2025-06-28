import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { ModalConfig } from '../../../core/services/modal.service';

export interface ImageModalData {
  images: string[];
  currentIndex: number;
  productName: string;
}

@Component({
  selector: 'app-image-modal',
  templateUrl: './image-modal.component.html',
  styleUrls: ['./image-modal.component.scss']
})
export class ImageModalComponent {
  @Input() config!: ModalConfig;
  @Output() close = new EventEmitter<void>();

  get imageData(): ImageModalData {
    return this.config.data as ImageModalData;
  }

  @HostListener('document:keydown.arrowLeft', ['$event'])
  onArrowLeft(): void {
    this.previousImage();
  }

  @HostListener('document:keydown.arrowRight', ['$event'])
  onArrowRight(): void {
    this.nextImage();
  }

  previousImage(): void {
    if (this.imageData.images.length > 1) {
      const newIndex = this.imageData.currentIndex > 0 
        ? this.imageData.currentIndex - 1 
        : this.imageData.images.length - 1;
      this.imageData.currentIndex = newIndex;
    }
  }

  nextImage(): void {
    if (this.imageData.images.length > 1) {
      const newIndex = this.imageData.currentIndex < this.imageData.images.length - 1 
        ? this.imageData.currentIndex + 1 
        : 0;
      this.imageData.currentIndex = newIndex;
    }
  }

  selectImage(index: number): void {
    this.imageData.currentIndex = index;
  }

  onClose(): void {
    this.close.emit();
  }
}