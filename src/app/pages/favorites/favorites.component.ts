import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Product } from 'src/shared/models/product.model';
import { FavoritesService } from '../../core/services/favorites.service';
import { CartService } from '../../core/services/cart.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.scss']
})
export class FavoritesComponent implements OnInit, OnDestroy {
  favorites: Product[] = [];
  isLoading = false;

  private destroy$ = new Subject<void>();

  constructor(
    private favoritesService: FavoritesService,
    private cartService: CartService,
    private router: Router,
    private translate: TranslateService
  ) { }

  ngOnInit(): void {
    this.loadFavorites();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load favorites from service
   */
  private loadFavorites(): void {
    this.isLoading = true;

    this.favoritesService.favorites$
      .pipe(takeUntil(this.destroy$))
      .subscribe(favorites => {
        this.favorites = favorites;
        this.isLoading = false;
      });
  }

  /**
   * Handle favorite removal
   */
  onRemoveFavorite(product: Product): void {
    this.favoritesService.removeFromFavorites(product.id);
  }

  /**
   * Add product to cart
   */
  onAddToCart(product: Product): void {
    const cartItem = {
      productId: product.id,
      name: product.name,
      price: Number(product.discount ? product.price * (1 - product.discount / 100) : product.price), // Convert to number
      imageUrl: product.imageUrl,
      discount: product.discount
    };

    this.cartService.addToCart(cartItem);
  }

  /**
   * Navigate to product detail
   */
  onProductClick(product: Product): void {
    this.router.navigate(['/product', product.id]);
  }

  /**
   * Clear all favorites
   */
  onClearFavorites(): void {
    if (confirm(this.translate.instant('FAVORITES.CLEAR_CONFIRM_MSG'))) {
      this.favoritesService.clearFavorites();
    }
  }

  /**
   * Navigate to shop
   */
  onShopNow(): void {
    this.router.navigate(['/shop']);
  }

  /**
   * Go back to previous page or shop
   */
  goBack(): void {
    this.router.navigate(['/shop']);
  }

  /**
   * Get discounted price
   */
  getDiscountedPrice(product: Product): number {
    if (product.discount) {
      return Number(product.price) * (1 - Number(product.discount) / 100);
    }
    return Number(product.price);
  }
} 