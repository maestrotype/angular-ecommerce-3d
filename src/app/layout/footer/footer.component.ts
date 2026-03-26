import { Component, OnInit, OnDestroy, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ModalService } from '../../core/services/modal.service';
import { CartService } from '../../core/services/cart.service';
import { FavoritesService } from '../../core/services/favorites.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})


export class FooterComponent implements OnInit, OnDestroy, OnChanges {
  @Input() data: any; // Support for Architect Live Preview
  cartCount = 0;
  favoritesCount = 0;
  currentYear = new Date().getFullYear();
  private cartSubscription: Subscription = new Subscription();
  private favoritesSubscription: Subscription = new Subscription();

  constructor(
    private modalService: ModalService,
    private cartService: CartService,
    private favoritesService: FavoritesService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.cartSubscription = this.cartService.getTotalCount().subscribe(
      count => this.cartCount = count
    );

    this.favoritesSubscription = this.favoritesService.favoritesCount$.subscribe(
      count => this.favoritesCount = count
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) {
      // Future footer live preview logic can go here
    }
  }

  ngOnDestroy(): void {
    this.cartSubscription.unsubscribe();
    this.favoritesSubscription.unsubscribe();
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

  openFavoritesPage(): void {
    this.router.navigate(['/favorites']);
  }

  goHome() {
    this.router.navigate(['/home']);
  }
}
