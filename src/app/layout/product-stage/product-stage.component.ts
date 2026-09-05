import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  Input,
  OnDestroy,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Product } from 'src/shared/models/product.model';
import { Section } from 'src/shared/models/section.model';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { NotificationService } from '../../core/services/notification.service';
import { ThreeDViewerComponent } from '../../components/three-d-viewer/three-d-viewer.component';
import { LocalizedPipe } from '../../shared/pipes/localized.pipe';
import { ImageUrlPipe } from '../../shared/pipes/image-url.pipe';
import { getLocalizedString } from '../../../shared/utils/localization.util';
import {
  DEFAULT_STAGE_CATEGORIES,
  DEFAULT_STAGE_LIMIT,
  pickStageProducts,
  stageModelPath,
} from '../../../shared/utils/product-stage.util';

@Component({
  selector: 'app-product-stage',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    ThreeDViewerComponent,
    LocalizedPipe,
    ImageUrlPipe,
  ],
  templateUrl: './product-stage.component.html',
  styleUrls: ['./product-stage.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductStageComponent implements OnDestroy {
  products: Product[] = [];
  activeIndex = 0;
  autoRotate = true;
  loading = true;
  empty = false;
  modelScale: [number, number, number] = [8, 8, 8];
  modelPosition: [number, number, number] = [0, -0.15, 0];

  private fetched = false;
  private lastPickKey = '';
  private catalogSub?: Subscription;

  @Input() set data(section: Section | null) {
    this._data = section;
    this.applySettings(section);
    const key = this.pickKey(section);
    if (key !== this.lastPickKey) {
      this.lastPickKey = key;
      this.fetchProducts();
    } else if (!this.fetched) {
      this.fetchProducts();
    }
  }

  get data(): Section | null {
    return this._data;
  }

  private _data: Section | null = null;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private notificationService: NotificationService,
    private translate: TranslateService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.autoRotate = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    this.catalogSub = this.productService.catalogChanged$.subscribe(() => {
      this.fetchProducts();
    });
  }

  get active(): Product | undefined {
    return this.products[this.activeIndex];
  }

  get activeList(): Product[] {
    return this.active ? [this.active] : [];
  }

  ngOnDestroy(): void {
    this.fetched = false;
    this.catalogSub?.unsubscribe();
  }

  private pickKey(section: Section | null): string {
    const settings = (section?.settings || {}) as {
      productIds?: Array<number | string>;
      categories?: string[];
      limit?: number;
    };
    return JSON.stringify({
      ids: settings.productIds || [],
      cats: settings.categories || [],
      limit: settings.limit ?? DEFAULT_STAGE_LIMIT,
    });
  }

  trackByProductId(_index: number, product: Product): number {
    return product.id;
  }

  modelPathOf(product: Product): string {
    return stageModelPath(product);
  }

  select(index: number): void {
    if (!this.products.length) {
      return;
    }
    this.activeIndex = ((index % this.products.length) + this.products.length) % this.products.length;
    this.cdr.markForCheck();
  }

  addActiveToCart(): void {
    const product = this.active;
    if (!product) {
      return;
    }
    if (!this.cartService.addToCart({
      productId: product.id,
      name: product.name,
      price: Number(product.price),
      imageUrl: product.imageUrl,
      discount: product.discount,
    })) {
      this.notificationService.showInfo(this.translate.instant('DEMO_CATALOG.ADD_TO_CART_BLOCKED'));
      return;
    }
    const name = getLocalizedString(product.name, this.translate.currentLang);
    this.notificationService.showSuccess(
      this.translate.instant('SHOP.NOTIFICATIONS.ADDED_TO_CART', { name }),
    );
  }

  viewActive(): void {
    const product = this.active;
    if (!product) {
      return;
    }
    this.router.navigate(['/product', product.id]).then(() => {
      if (isPlatformBrowser(this.platformId)) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  private applySettings(section: Section | null): void {
    const settings = (section?.settings || {}) as {
      autoRotate?: boolean;
    };
    if (isPlatformBrowser(this.platformId) && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.autoRotate = false;
      return;
    }
    this.autoRotate = settings.autoRotate !== false;
  }

  private fetchProducts(): void {
    this.fetched = true;
    this.productService.getProducts().subscribe({
      next: (products) => {
        const settings = (this._data?.settings || {}) as {
          productIds?: Array<number | string>;
          categories?: string[];
          limit?: number;
          autoRotate?: boolean;
        };
        this.products = pickStageProducts(products, {
          productIds: settings.productIds,
          categories: settings.categories?.length
            ? settings.categories
            : DEFAULT_STAGE_CATEGORIES,
          limit: settings.limit ?? DEFAULT_STAGE_LIMIT,
        });
        this.activeIndex = 0;
        this.empty = this.products.length === 0;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.products = [];
        this.empty = true;
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }
}
