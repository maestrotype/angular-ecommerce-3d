import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { ViewportScroller } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { Product } from '@shared/models/product.model';

const CATEGORY_I18N: Record<string, string> = {
  shoes: 'FOOTER.CAT_SHOES',
  bags: 'FOOTER.CAT_HANDBAGS',
  handbags: 'FOOTER.CAT_HANDBAGS',
  clothing: 'FOOTER.CAT_CLOTHING',
  accessories: 'FOOTER.CAT_ACCESSORIES',
};

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
  @Input() showProductCode = false;
  @Input() layout: 'grid' | 'list' = 'grid';
  @Output() productClick = new EventEmitter<Product>();
  @Output() favoriteToggle = new EventEmitter<{ product: Product; isFavorite: boolean }>();
  @Output() addToCart = new EventEmitter<Product>();

  constructor(
    private router: Router,
    private viewportScroller: ViewportScroller,
    private translate: TranslateService,
  ) {}

  get categoryLabel(): string {
    const slug = (this.product?.category || '').trim();
    if (!slug) {
      return '';
    }
    const key = CATEGORY_I18N[slug.toLowerCase()];
    if (key) {
      const translated = this.translate.instant(key);
      if (translated && translated !== key) {
        return translated;
      }
    }
    return slug;
  }

  get hasRating(): boolean {
    return Number(this.product?.rating) > 0;
  }

  onProductClick(): void {
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
    const price = Number(this.product.price) || 0;
    if (this.product.discount) {
      return price * (1 - this.product.discount / 100);
    }
    return price;
  }

  getStarsArray(): Array<{ filled: boolean }> {
    const rating = Number(this.product.rating) || 0;
    return Array.from({ length: 5 }, (_, i) => ({ filled: i < Math.floor(rating) }));
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
