import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { ModalService } from '../../core/services/modal.service';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})


export class FooterComponent {
  cartCount = 0;
  private cartSubscription: Subscription = new Subscription();
  constructor(
    private modalService: ModalService,
    private cartService: CartService
    ) {}

  ngOnInit(): void {
    this.cartSubscription = this.cartService.getTotalCount().subscribe(
      count => this.cartCount = count
    );
  }

  ngOnDestroy(): void {
    this.cartSubscription.unsubscribe();
  }

  openAuthModal(): void {
    this.modalService.openModal({
      id: 'auth-modal',
      type: 'auth',
      data: null,
      options: {
        closeOnBackdrop: true,
        closeOnEscape: true,
        showCloseButton: true
      }
    });
  }

  openCartModal(): void {
    this.modalService.openModal({
      id: 'cart-modal',
      type: 'cart',
      data: null,
      options: {
        closeOnBackdrop: true,
        closeOnEscape: true,
        showCloseButton: true
      }
    });
  }
}
