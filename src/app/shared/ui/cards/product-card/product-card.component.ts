import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { ViewportScroller } from '@angular/common';
import { Product } from '@shared/models/product.model';

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCardComponent {
  @Input() product!: Product;
  @Input() showFavorite = true;
  @Input() showAddToCart = true;
  @Input() layout: 'grid' | 'list' = 'grid';
  @Output() productClick = new EventEmitter<Product>();
  @Output() favoriteToggle = new EventEmitter<{ product: Product; isFavorite: boolean }>();
  @Output() addToCart = new EventEmitter<Product>();

  constructor(
    private router: Router,
    private viewportScroller: ViewportScroller
  ) { }

  onProductClick(): void {
    // Navigate to product page and scroll to top
    this.router.navigate(['/product', this.product.id]).then(() => {
      this.viewportScroller.scrollToPosition([0, 0]);
    });
    this.productClick.emit(this.product);
  }

  onFavoriteToggle(event: { product: Product; isFavorite: boolean }): void {
    this.favoriteToggle.emit(event);
  }

  onAddToCart(event?: Event): void {
    event?.stopPropagation();
    this.addToCart.emit(this.product);
  }

  getDiscountedPrice(): number {
    if (this.product.discount) {
      return this.product.price * (1 - this.product.discount / 100);
    }
    return this.product.price;
  }

  getStarsArray(): Array<{ filled: boolean }> {
    const rating = this.product.rating || 0;
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push({ filled: i <= rating });
    }
    return stars;
  }

  onQuickView(event: Event): void {
    event.stopPropagation();
    this.onProductClick();
  }

  get cardClasses(): string {
    const classes = ['product-card'];

    if (this.layout === 'list') {
      classes.push('list-card');
    }

    if (this.product.isSpecial) {
      classes.push('special-offer');
    }

    return classes.join(' ');
  }
} 