import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ModalConfig } from '../../../core/services/modal.service';

@Component({
  selector: 'app-cart-modal',
  templateUrl: './cart-modal.component.html',
  styleUrls: ['./cart-modal.component.scss']
})
export class CartModalComponent {
  @Input() config!: ModalConfig;
  @Output() close = new EventEmitter<void>();

  // Заглушка для корзины
  cartItems = [
    {
      id: 1,
      name: 'Premium Wireless Headphones',
      price: 299.99,
      quantity: 1,
      image: '/assets/images/bag2/img1.png'
    }
  ];

  get totalPrice(): number {
    return this.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  onClose(): void {
    this.close.emit();
  }

  updateQuantity(itemId: number, change: number): void {
    const item = this.cartItems.find(i => i.id === itemId);
    if (item) {
      item.quantity = Math.max(1, item.quantity + change);
    }
  }

  removeItem(itemId: number): void {
    this.cartItems = this.cartItems.filter(item => item.id !== itemId);
  }

  checkout(): void {
    // Order logic
    console.log('Checkout:', this.cartItems);
    this.onClose();
  }
}