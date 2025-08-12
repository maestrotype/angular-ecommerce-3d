import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { ModalConfig } from '../../../core/services/modal.service';
import { CartService } from '../../../core/services/cart.service';
import { ModalService } from '../../../core/services/modal.service';
import { NotificationService } from '../../../core/services/notification.service';
import { CartItem } from 'src/shared/models/cart-item.model';
import { CreateOrderRequest } from 'src/shared/models/create-order-request.model';

@Component({
  selector: 'app-cart-modal',
  templateUrl: './cart-modal.component.html',
  styleUrls: ['./cart-modal.component.scss']
})
export class CartModalComponent {
  @Input() config!: ModalConfig;
  @Output() close = new EventEmitter<void>();
  cartItems: CartItem[] = [];
  totalPrice = 0;
  private subscriptions = new Subscription();

  constructor(
    private cartService: CartService,
    private modalService: ModalService,
    private notificationService: NotificationService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.subscriptions.add(
      this.cartService.getCartItems().subscribe(items => {
        this.cartItems = items;
      })
    );

    this.subscriptions.add(
      this.cartService.getTotalPrice().subscribe(price => {
        this.totalPrice = price;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onClose(): void {
    this.close.emit();
  }

  updateQuantity(itemId: number, change: number): void {
    const item = this.cartItems.find(i => i.productId === itemId);
    if (item) {
      item.quantity = Math.max(1, item.quantity + change);
    }
  }

  removeItem(itemId: number): void {
    this.cartService.removeFromCart(itemId);
  }

  checkout(): void {
    // Navigate to checkout page instead of creating order directly
    this.onClose();
    this.router.navigate(['/checkout']);
  }
}