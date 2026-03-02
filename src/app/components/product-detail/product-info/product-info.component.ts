import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Product } from 'src/shared/models/product.model';
import { extractString } from 'src/shared/models/localization.model';
import { CartService } from '../../../core/services/cart.service';
import { FavoritesService } from '../../../core/services/favorites.service';
import { NotificationService } from '../../../core/services/notification.service';

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

  constructor(
    private cartService: CartService,
    private favoritesService: FavoritesService,
    private notificationService: NotificationService
  ) { }

  incrementQuantity(): void {
    if (this.isOutOfStock()) return;
    this.quantity++;
    this.quantityChanged.emit(this.quantity);
  }

  decrementQuantity(): void {
    if (this.isOutOfStock()) return;
    if (this.quantity > 1) {
      this.quantity--;
      this.quantityChanged.emit(this.quantity);
    }
  }

  onAddToCart(): void {
    if (this.isOutOfStock()) {
      this.notificationService.showError('This item is out of stock.');
      return;
    }

    const cartItem = {
      productId: this.product.id,
      name: this.product.name,
      price: this.getDiscountedPrice(),
      imageUrl: this.product.imageUrl,
      discount: this.product.discount
    };

    for (let i = 0; i < this.quantity; i++) {
      this.cartService.addToCart(cartItem);
    }

    this.notificationService.showSuccess(`Added ${this.quantity} ${extractString(this.product.name)} to cart!`);
  }

  getDiscountedPrice(): number {
    if (this.product && this.product.discount) {
      return this.product.price * (1 - this.product.discount / 100);
    }
    return this.product?.price || 0;
  }

  isOutOfStock(): boolean {
    const stock = this.product?.stock ?? 0;
    return stock <= 0;
  }

  /**
   * Handle favorite toggle events
   */
  onFavoriteToggled(event: { product: Product; isFavorite: boolean }): void {

  }

  /**
   * Get key specifications to display in summary
   */
  getKeySpecs(): Array<{ key: string, value: string }> {
    if (!this.product?.specifications) {
      return [];
    }

    const specs = this.product.specifications;
    const keySpecs = ['Material', 'Color', 'Size', 'Weight', 'Brand'];

    return keySpecs
      .filter(key => specs[key as keyof typeof specs])
      .map(key => ({
        key,
        value: String(specs[key as keyof typeof specs])
      }))
      .slice(0, 4); // Show max 4 specs
  }
}
