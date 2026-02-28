import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { ModalService } from '../../core/services/modal.service';
import { Product } from 'src/shared/models/product.model';
import { CartService } from 'src/app/core/services/cart.service';
import { ViewportScroller } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { getLocalizedString } from '../../../shared/utils/localization.util';

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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService,
    private modalService: ModalService,
    private translate: TranslateService,
    private viewportScroller: ViewportScroller
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
            this.quantity = 1;

            // Ensure we're scrolled to top after product loads
            setTimeout(() => {
              this.viewportScroller.scrollToPosition([0, 0]);
            }, 100);
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

  onThumbnailSelected(type: 'image' | '3d', index?: number): void {
    this.selectedType = type;
    if (type === 'image' && index !== undefined) {
      this.selectedImageIndex = index;
    }
  }

  onImageSelected(index: number): void {
    this.selectedImageIndex = index;
  }

  onImageClicked(): void {
    if (this.product && this.product.images) {
      this.modalService.openModal({
        id: 'product-image-modal',
        type: 'image',
        data: {
          images: this.product.images,
          currentIndex: this.selectedImageIndex,
          productName: this.product.name
        },
        options: {
          closeOnBackdrop: true,
          closeOnEscape: true,
          showCloseButton: true
        }
      });
    }
  }

  onQuantityChanged(newQuantity: number): void {
    this.quantity = newQuantity;
  }

  onAddToCart(): void {
    if (this.product) {
      const cartItem = {
        productId: this.product.id,
        name: this.product.name,
        price: Number(this.product.price), // Convert to number
        imageUrl: this.product.imageUrl,
        discount: this.product.discount
      };
      this.cartService.addToCart(cartItem);
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
}