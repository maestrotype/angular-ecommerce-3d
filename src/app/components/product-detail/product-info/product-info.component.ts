import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Product } from '../../../core/models/Product';
import { CartService } from '../../../core/services/cart.service';

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

  constructor(private cartService: CartService) {}

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
    const cartItem = {
      id: this.product.id,
      name: this.product.name,
      price: this.getDiscountedPrice(),
      image: this.product.imageUrl,
      originalPrice: this.product.discount ? this.product.price : undefined,
      discount: this.product.discount
    };

    for (let i = 0; i < this.quantity; i++) {
      this.cartService.addToCart(cartItem);
    }

    // Show success message (you can integrate with a toast service)
    alert(`Added ${this.quantity} ${this.product.name} to cart!`);
  }

  getDiscountedPrice(): number {
    if (this.product && this.product.discount) {
      return this.product.price * (1 - this.product.discount / 100);
    }
    return this.product?.price || 0;
  }
}
