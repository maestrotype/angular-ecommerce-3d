import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  ViewChild
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Product } from 'src/shared/models/product.model';
import { Section } from 'src/shared/models/section.model';
import { PageSectionContext } from 'src/shared/models/page-section-context.model';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { FavoritesService } from '../../core/services/favorites.service';
import { NotificationService } from '../../core/services/notification.service';
import { LocalizedPipe } from '../../shared/pipes/localized.pipe';
import { getLocalizedString } from '../../../shared/utils/localization.util';

type CarouselSource = 'new' | 'best-sellers' | 'special' | 'all';
type ProductCarouselData = Section & { context?: PageSectionContext };

@Component({
  selector: 'app-product-carousel',
  templateUrl: './product-carousel.component.html',
  styleUrls: ['./product-carousel.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, LocalizedPipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductCarouselComponent implements OnInit, OnDestroy {
  products: Product[] = [];
  source: CarouselSource = 'new';
  autoplay = true;
  private limit = 8;
  private contextApplied = false;
  private timer?: ReturnType<typeof setInterval>;

  @ViewChild('track') trackRef?: ElementRef<HTMLElement>;

  @Input() set data(val: ProductCarouselData) {
    this.source = this.readSource(val?.settings?.source);
    this.limit = this.readLimit(val?.settings?.limit);
    this.autoplay = val?.settings?.autoplay !== false;
    this.section = val;

    if (val?.context?.bestSellers && this.source === 'best-sellers') {
      this.products = this.sliceProducts(val.context.bestSellers);
      this.contextApplied = true;
      this.cdr.markForCheck();
    }
  }

  section?: ProductCarouselData;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private favoritesService: FavoritesService,
    private notificationService: NotificationService,
    private translate: TranslateService,
    private router: Router,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (this.contextApplied) {
      this.startAutoplay();
      return;
    }

    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products = this.sliceProducts(this.filterBySource(products));
        this.cdr.markForCheck();
        this.startAutoplay();
      },
      error: () => {}
    });
  }

  ngOnDestroy(): void {
    this.stopAutoplay();
  }

  trackByProductId(_index: number, product: Product): number {
    return product.id;
  }

  isFavorite(productId: number): boolean {
    return this.favoritesService.isFavorite(productId);
  }

  toggleFavorite(product: Product): void {
    this.favoritesService.toggleFavorite(product);
    const name = getLocalizedString(product.name, this.translate.currentLang);
    const messageKey = this.isFavorite(product.id)
      ? 'SHOP.NOTIFICATIONS.ADDED_TO_FAVORITES'
      : 'SHOP.NOTIFICATIONS.REMOVED_FROM_FAVORITES';
    this.translate.get(messageKey, { name }).subscribe(msg => {
      this.notificationService.showSuccess(msg);
    });
  }

  goToProductDetail(productId: number): void {
    this.router.navigate(['/product', productId]).then(() => {
      if (isPlatformBrowser(this.platformId)) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  addToCart(product: Product, event?: Event): void {
    event?.stopPropagation();
    this.cartService.addToCart({
      productId: product.id,
      name: product.name,
      price: Number(product.price),
      imageUrl: product.imageUrl,
      discount: product.discount
    });
    const productName = getLocalizedString(product.name, this.translate.currentLang);
    this.notificationService.showSuccess(`Added ${productName} to cart!`);
  }

  scrollByDir(dir: -1 | 1): void {
    const track = this.trackRef?.nativeElement;
    if (!track) {
      return;
    }
    const amount = Math.max(track.clientWidth * 0.72, 280);
    track.scrollBy({ left: dir * amount, behavior: 'smooth' });
  }

  pauseAutoplay(): void {
    this.stopAutoplay();
  }

  resumeAutoplay(): void {
    this.startAutoplay();
  }

  private filterBySource(products: Product[]): Product[] {
    if (this.source === 'new') {
      const fresh = products.filter(item => item.isNew);
      return fresh.length ? fresh : products;
    }
    if (this.source === 'special') {
      const specials = products.filter(item => item.isSpecial || !!item.discount);
      return specials.length ? specials : products;
    }
    if (this.source === 'best-sellers') {
      return [...products].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }
    return products;
  }

  private sliceProducts(products: Product[]): Product[] {
    return products.slice(0, this.limit);
  }

  private readSource(value: unknown): CarouselSource {
    if (value === 'best-sellers' || value === 'special' || value === 'all' || value === 'new') {
      return value;
    }
    return 'new';
  }

  private readLimit(value: unknown): number {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
      return 8;
    }
    return Math.min(16, Math.max(3, Math.round(parsed)));
  }

  private startAutoplay(): void {
    this.stopAutoplay();
    if (!this.autoplay || !isPlatformBrowser(this.platformId) || this.products.length < 3) {
      return;
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    this.ngZone.runOutsideAngular(() => {
      this.timer = setInterval(() => {
        this.ngZone.run(() => this.scrollByDir(1));
      }, 4800);
    });
  }

  private stopAutoplay(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }
}
