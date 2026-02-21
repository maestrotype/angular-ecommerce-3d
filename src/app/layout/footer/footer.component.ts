import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription, Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { ModalService } from '../../core/services/modal.service';
import { CartService } from '../../core/services/cart.service';
import { FavoritesService } from '../../core/services/favorites.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})


export class FooterComponent implements OnInit, OnDestroy {
  cartCount = 0;
  favoritesCount = 0;
  isHidden = false;
  private cartSubscription: Subscription = new Subscription();
  private favoritesSubscription: Subscription = new Subscription();
  private scrollSubject = new Subject<void>();
  private lastScrollTop = 0;

  constructor(
    private modalService: ModalService,
    private cartService: CartService,
    private favoritesService: FavoritesService,
    private router: Router
  ) {
    // Debounce scroll stop logic
    this.scrollSubject.pipe(
      debounceTime(150) // Show footer back after 150ms of no scrolling
    ).subscribe(() => {
      this.isHidden = false;
    });
  }

  ngOnInit(): void {
    this.cartSubscription = this.cartService.getTotalCount().subscribe(
      count => this.cartCount = count
    );

    this.favoritesSubscription = this.favoritesService.favoritesCount$.subscribe(
      count => this.favoritesCount = count
    );
  }

  ngOnDestroy(): void {
    this.cartSubscription.unsubscribe();
    this.favoritesSubscription.unsubscribe();
    this.scrollSubject.complete();
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // Minimal movement check to avoid flickering on iOS rubber banding
    if (Math.abs(currentScrollTop - this.lastScrollTop) < 5) return;

    // While scrolling, hide footer
    if (!this.isHidden) {
      this.isHidden = true;
    }

    // Emit to scroll subject to trigger "scroll stopped" detection
    this.scrollSubject.next();

    this.lastScrollTop = currentScrollTop;
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
}
