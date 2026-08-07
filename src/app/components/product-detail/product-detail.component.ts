import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { ModalService } from '../../core/services/modal.service';
import { Product } from 'src/shared/models/product.model';
import { CartService } from 'src/app/core/services/cart.service';
import { ViewportScroller } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { SectionService } from 'src/admin/services/section.service';
import { Section } from 'src/shared/models/section.model';
import { getLocalizedString } from '../../../shared/utils/localization.util';
import { ProductTabsComponent } from './product-tabs/product-tabs.component';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent implements OnInit {
  product: Product | undefined;
  selectedType: 'image' | '3d' = 'image';
  selectedImageIndex: number = 0;
  quantity: number = 1;
  loading: boolean = true;
  sections: Section[] = [];
  activeSection: 'about' | 'specs' | 'reviews' = 'about';
  carouselActiveIndex = 0;

  @ViewChild(ProductTabsComponent) productTabs?: ProductTabsComponent;
  @ViewChild('carouselTrack') carouselTrack?: ElementRef<HTMLElement>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService,
    private modalService: ModalService,
    private translate: TranslateService,
    private viewportScroller: ViewportScroller,
    private sectionService: SectionService
  ) { }

  ngOnInit(): void {
    // Subscribe to route params to handle navigation between products
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));


      // Scroll to top immediately when route changes
      this.viewportScroller.scrollToPosition([0, 0]);

      if (id) {
        this.loading = true;
        this.product = undefined; // Clear previous product

        this.productService.getProductById(id).subscribe({
          next: (product) => {

            this.product = product;
            this.loading = false;
            // Reset view state
            this.selectedType = 'image';
            this.selectedImageIndex = 0;
            this.carouselActiveIndex = 0;
            this.quantity = 1;

            // Ensure we're scrolled to top after product loads
            setTimeout(() => {
              this.viewportScroller.scrollToPosition([0, 0]);
            }, 100);

            this.loadModularSections();
          },
          error: (error) => {

            this.loading = false;
            this.router.navigate(['/shop']);
          }
        });
      } else {

        this.router.navigate(['/shop']);
      }
    });
  }

  get carouselSlideCount(): number {
    const imageCount = this.product?.images?.length ?? 0;
    return imageCount + (this.product?.model3dUrl ? 1 : 0);
  }

  get carouselSlideIndices(): number[] {
    return Array.from({ length: this.carouselSlideCount }, (_, index) => index);
  }

  onThumbnailSelected(type: 'image' | '3d', index?: number): void {
    this.selectedType = type;
    if (type === 'image' && index !== undefined) {
      this.selectedImageIndex = index;
    }
  }

  onCarouselScroll(event: Event): void {
    const track = event.target as HTMLElement;
    const slideWidth = track.clientWidth;
    if (slideWidth <= 0) {
      return;
    }

    const index = Math.round(track.scrollLeft / slideWidth);
    this.updateCarouselSelection(index);
  }

  goToCarouselSlide(index: number): void {
    const track = this.carouselTrack?.nativeElement;
    if (!track) {
      return;
    }

    track.scrollTo({
      left: index * track.clientWidth,
      behavior: 'smooth'
    });
    this.updateCarouselSelection(index);
  }

  private updateCarouselSelection(index: number): void {
    const imageCount = this.product?.images?.length ?? 0;
    const clampedIndex = Math.max(0, Math.min(index, this.carouselSlideCount - 1));

    if (clampedIndex < imageCount) {
      this.selectedType = 'image';
      this.selectedImageIndex = clampedIndex;
    } else {
      this.selectedType = '3d';
    }

    this.carouselActiveIndex = clampedIndex;
  }

  onImageSelected(index: number): void {
    this.selectedImageIndex = index;
  }


  onImageClicked(): void {
    if (!this.product) return;
    const productId = this.route.snapshot.paramMap.get('id');
    const queryParams: any = {
      productId,
      mode: this.selectedType,
      index: this.selectedImageIndex,
      name: encodeURIComponent(typeof this.product.name === 'object'
        ? getLocalizedString(this.product.name, this.translate.currentLang)
        : (this.product.name || ''))
    };

    if (this.product.images?.length) {
      queryParams['images'] = encodeURIComponent(JSON.stringify(this.product.images));
    }
    if (this.product.model3dUrl) {
      queryParams['model'] = encodeURIComponent(this.product.model3dUrl);
    }

    this.router.navigate(['/viewer'], { queryParams });
  }

  onQuantityChanged(newQuantity: number): void {
    this.quantity = newQuantity;
  }

  onAddToCart(): void {
    if (!this.product || this.product.stock !== undefined && this.product.stock <= 0) {
      return;
    }

    const unitPrice = this.product.discount
      ? Number(this.product.price) * (1 - this.product.discount / 100)
      : Number(this.product.price);

    const cartItem = {
      productId: this.product.id,
      name: this.product.name,
      price: unitPrice,
      imageUrl: this.product.imageUrl,
      discount: this.product.discount
    };

    for (let i = 0; i < this.quantity; i++) {
      this.cartService.addToCart(cartItem);
    }

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

  goBack(): void {
    this.router.navigate(['/shop']);
  }

  navigateToHome(): void {
    this.router.navigate(['/home']);
  }

  navigateToShop(): void {
    this.router.navigate(['/shop']);
  }

  navigateToCategory(): void {
    if (this.product) {
      this.router.navigate(['/shop'], {
        queryParams: { category: this.product.category }
      });
    }
  }

  scrollToSection(section: 'about' | 'specs' | 'reviews'): void {
    this.activeSection = section;

    if (section === 'about') {
      this.productTabs?.setActiveTab('description');
    } else if (section === 'specs') {
      this.productTabs?.setActiveTab('specifications');
    }

    const el = document.getElementById(`pdp-${section}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  private loadModularSections(): void {
    this.sectionService.getActiveSections('product').subscribe(sections => {
      this.sections = (sections || []).sort((a, b) => (a.order || 0) - (b.order || 0));
    });
  }
}