import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Product } from '../../../core/models/Product';

@Component({
  selector: 'app-product-info',
  templateUrl: './product-info.component.html',
  styleUrls: ['./product-info.component.scss']
})
export class ProductInfoComponent {
  @Input() product!: Product;
  @Input() quantity: number = 1;
  @Output() quantityChanged = new EventEmitter<number>();
  @Output() addToCart = new EventEmitter<void>();

  incrementQuantity(): void {
    this.quantity++;
    this.quantityChanged.emit(this.quantity);
  }

  decrementQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
      this.quantityChanged.emit(this.quantity);
    }
  }

  onAddToCart(): void {
    this.addToCart.emit();
  }

  getDiscountedPrice(): number {
    if (this.product && this.product.discount) {
      return this.product.price * (1 - this.product.discount / 100);
    }
    return this.product?.price || 0;
  }
}
