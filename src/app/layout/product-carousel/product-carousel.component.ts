import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  SimpleChanges
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Product } from 'src/shared/models/product.model';
import { LocalizedString } from 'src/shared/models/localized-string.model';
import { Section } from 'src/shared/models/section.model';
import { PageSectionContext } from 'src/shared/models/page-section-context.model';
import { ProductService } from '../../core/services/product.service';
import { LocalizedPipe } from '../../shared/pipes/localized.pipe';
import { ImageUrlPipe } from '../../shared/pipes/image-url.pipe';

type CarouselSource = 'new' | 'best-sellers' | 'special' | 'all';
type CarouselMode = 'products' | 'custom';

interface CarouselSlideItem {
  image: string;
  title: string | LocalizedString;
  subtitle?: string | LocalizedString;
  link?: string;
  price?: number;
  isActive?: boolean;
}

interface CarouselProduct extends Product {
  customLink?: string;
}
type ProductCarouselData = Section & { context?: PageSectionContext };

@Component({
  selector: 'app-product-carousel',
  templateUrl: './product-carousel.component.html',
  styleUrls: ['./product-carousel.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, LocalizedPipe, ImageUrlPipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductCarouselComponent implements OnInit, OnChanges, OnDestroy {
  products: CarouselProduct[] = [];
  activeIndex = 0;
  source: CarouselSource = 'new';
  mode: CarouselMode = 'products';
  autoplay = true;
  readonly intervalMs = 4800;
  private limit = 8;
  private loadedFromContext = false;
  private fetched = false;
  private timer?: ReturnType<typeof setInterval>;
  private dragStartX = 0;
  private dragging = false;

  @Input() data: ProductCarouselData | null = null;

  constructor(
    private productService: ProductService,
    private router: Router,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  get current(): CarouselProduct | undefined {
    return this.products[this.activeIndex];
  }

  ngOnInit(): void {
    this.applyData(this.data);
    if (!this.loadedFromContext) {
      this.fetchProducts();
    }
    this.startAutoplay();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && !changes['data'].firstChange) {
      this.applyData(this.data);
      if (!this.loadedFromContext && !this.fetched) {
        this.fetchProducts();
      }
      this.startAutoplay();
    }
  }

  ngOnDestroy(): void {
    this.stopAutoplay();
  }

  trackByProductId(_index: number, product: CarouselProduct): number {
    return product.id;
  }

  imageOf(product: CarouselProduct): string {
    return product.imageUrl || product.images?.[0] || '';
  }

  goTo(index: number, event?: Event): void {
    event?.stopPropagation();
    if (!this.products.length) {
      return;
    }
    const total = this.products.length;
    this.activeIndex = ((index % total) + total) % total;
    this.cdr.markForCheck();
    this.startAutoplay();
  }

  next(event?: Event): void {
    event?.stopPropagation();
    this.goTo(this.activeIndex + 1);
  }

  prev(event?: Event): void {
    event?.stopPropagation();
    this.goTo(this.activeIndex - 1);
  }

  openCurrent(event?: Event): void {
    event?.preventDefault();
    event?.stopPropagation();
    const product = this.current;
    if (!product) {
      return;
    }
    if (product.customLink) {
      this.router.navigateByUrl(product.customLink).then(() => {
        if (isPlatformBrowser(this.platformId)) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
      return;
    }
    this.goToProductDetail(product.id);
  }

  onPointerDown(event: PointerEvent): void {
    if (this.isChromeControl(event.target)) {
      return;
    }
    this.dragging = true;
    this.dragStartX = event.clientX;
    this.pauseAutoplay();
  }

  onPointerUp(event: PointerEvent): void {
    if (!this.dragging) {
      return;
    }
    this.dragging = false;
    const dx = event.clientX - this.dragStartX;
    if (dx > 48) {
      this.prev();
    } else if (dx < -48) {
      this.next();
    } else {
      this.resumeAutoplay();
    }
  }

  private isChromeControl(target: EventTarget | null): boolean {
    return !!(target as HTMLElement | null)?.closest(
      'button, a, .product-carousel__controls, .product-carousel__thumbs'
    );
  }

  pauseAutoplay(): void {
    this.stopAutoplay();
  }

  resumeAutoplay(): void {
    this.startAutoplay();
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.next();
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.prev();
    } else if (event.key === 'Enter') {
      event.preventDefault();
      this.openCurrent();
    }
  }

  goToProductDetail(productId: number): void {
    this.router.navigate(['/product', productId]).then(() => {
      if (isPlatformBrowser(this.platformId)) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  private applyData(val: ProductCarouselData | null | undefined): void {
    this.mode = val?.settings?.mode === 'custom' ? 'custom' : 'products';
    this.source = this.readSource(val?.settings?.source);
    this.limit = this.readLimit(val?.settings?.limit);
    this.autoplay = val?.settings?.autoplay !== false;
    this.data = val || this.data;

    if (this.mode === 'custom') {
      const slides = (val?.settings?.slides as CarouselSlideItem[] | undefined) || [];
      this.products = slides
        .filter(slide => slide.isActive !== false && !!slide.image)
        .map((slide, index) => this.mapCustomSlide(slide, index));
      this.activeIndex = Math.min(this.activeIndex, Math.max(0, this.products.length - 1));
      this.loadedFromContext = true;
      this.cdr.markForCheck();
      return;
    }

    const fromContext = this.productsFromContext(val?.context);
    if (fromContext.length) {
      this.products = this.sliceProducts(this.filterBySource(fromContext));
      this.activeIndex = Math.min(this.activeIndex, Math.max(0, this.products.length - 1));
      this.loadedFromContext = true;
      this.cdr.markForCheck();
    }
  }

  private productsFromContext(context?: PageSectionContext): Product[] {
    if (!context) {
      return [];
    }
    if (this.source === 'best-sellers' && context.bestSellers?.length) {
      return context.bestSellers;
    }
    if (this.source === 'special' && context.specialOffers?.length) {
      return context.specialOffers;
    }
    if (context.catalog?.length) {
      return context.catalog;
    }
    if (context.bestSellers?.length) {
      return context.bestSellers;
    }
    return [];
  }

  private fetchProducts(): void {
    if (this.mode === 'custom') {
      return;
    }
    this.fetched = true;
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products = this.sliceProducts(this.filterBySource(products || []));
        this.activeIndex = 0;
        this.cdr.markForCheck();
        this.startAutoplay();
      },
      error: () => {
        this.products = [];
        this.cdr.markForCheck();
      }
    });
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

  private startAutoplay(): void {
    this.stopAutoplay();
    if (!this.autoplay || !isPlatformBrowser(this.platformId) || this.products.length < 2) {
      return;
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    this.ngZone.runOutsideAngular(() => {
      this.timer = setInterval(() => {
        this.ngZone.run(() => this.goTo(this.activeIndex + 1));
      }, this.intervalMs);
    });
  }

  private stopAutoplay(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
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

  private mapCustomSlide(slide: CarouselSlideItem, index: number): CarouselProduct {
    return {
      id: -(index + 1),
      name: slide.title,
      price: slide.price ?? 0,
      imageUrl: slide.image,
      customLink: slide.link || '/shop'
    };
  }
}
