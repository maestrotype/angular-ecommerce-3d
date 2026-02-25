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

  Math = Math;
  scale = 1;
  isDragging = false;
  startX = 0;
  startY = 0;
  translateX = 0;
  translateY = 0;

  get imageData(): ImageModalData {
    return this.config.data as ImageModalData;
  }

  get transformStyle(): string {
    return `translate(${this.translateX}px, ${this.translateY}px) scale(${this.scale})`;
  }

  @HostListener('document:keydown.arrowLeft', ['$event'])
  onArrowLeft(): void {
    this.previousImage();
  }

  @HostListener('document:keydown.arrowRight', ['$event'])
  onArrowRight(): void {
    this.nextImage();
  }

  // Mouse wheel zoom
  onWheel(event: WheelEvent): void {
    event.preventDefault();
    const zoomIntensity = 0.1;
    if (event.deltaY < 0) {
      this.zoomIn(zoomIntensity);
    } else {
      this.zoomOut(zoomIntensity);
    }
  }

  // Mouse drag to pan
  onMouseDown(event: MouseEvent): void {
    if (this.scale > 1) {
      this.isDragging = true;
      this.startX = event.clientX - this.translateX;
      this.startY = event.clientY - this.translateY;
    }
  }

  onMouseMove(event: MouseEvent): void {
    if (this.isDragging && this.scale > 1) {
      this.translateX = event.clientX - this.startX;
      this.translateY = event.clientY - this.startY;
    }
  }

  onMouseUp(): void {
    this.isDragging = false;
  }

  // Touch drag to pan
  onTouchStart(event: TouchEvent): void {
    if (event.touches.length === 1 && this.scale > 1) {
      this.isDragging = true;
      this.startX = event.touches[0].clientX - this.translateX;
      this.startY = event.touches[0].clientY - this.translateY;
    }
  }

  onTouchMove(event: TouchEvent): void {
    if (this.isDragging && this.scale > 1 && event.touches.length === 1) {
      event.preventDefault(); // Prevent scrolling the page
      this.translateX = event.touches[0].clientX - this.startX;
      this.translateY = event.touches[0].clientY - this.startY;
    }
  }

  onTouchEnd(): void {
    this.isDragging = false;
  }

  // Double click / Double tap to toggle zoom
  toggleZoom(): void {
    if (this.scale > 1) {
      this.resetZoom();
    } else {
      this.scale = 2.5; // Default zoom level on double-click
    }
  }

  zoomIn(amount: number = 0.5): void {
    this.scale = Math.min(this.scale + amount, 4); // Max 4x zoom
  }

  zoomOut(amount: number = 0.5): void {
    this.scale = Math.max(this.scale - amount, 1); // Min 1x zoom
    if (this.scale === 1) {
      this.resetZoom();
    }
  }

  resetZoom(): void {
    this.scale = 1;
    this.translateX = 0;
    this.translateY = 0;
    this.isDragging = false;
  }

  previousImage(): void {
    this.resetZoom();
    if (this.imageData.images.length > 1) {
      const newIndex = this.imageData.currentIndex > 0
        ? this.imageData.currentIndex - 1
        : this.imageData.images.length - 1;
      this.imageData.currentIndex = newIndex;
    }
  }

  nextImage(): void {
    this.resetZoom();
    if (this.imageData.images.length > 1) {
      const newIndex = this.imageData.currentIndex < this.imageData.images.length - 1
        ? this.imageData.currentIndex + 1
        : 0;
      this.imageData.currentIndex = newIndex;
    }
  }

  selectImage(index: number): void {
    this.resetZoom();
    this.imageData.currentIndex = index;
  }

  onClose(): void {
    this.close.emit();
  }
}