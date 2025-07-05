import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Product } from 'src/shared/models/product.model';

@Component({
  selector: 'app-product-images',
  templateUrl: './product-images.component.html',
  styleUrls: ['./product-images.component.scss']
})
export class ProductImagesComponent {
  @Input() product!: Product;
  @Input() selectedImageIndex: number = 0;
  @Output() imageSelected = new EventEmitter<number>();
  @Output() imageClicked = new EventEmitter<void>();

  selectImage(index: number): void {
    this.selectedImageIndex = index;
    this.imageSelected.emit(index);
  }

  onImageClick(): void {
    this.imageClicked.emit();
  }
}