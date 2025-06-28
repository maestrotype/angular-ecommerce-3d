import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { Product } from '../../core/models/Product';
import { ModalService } from '../../core/services/modal.service';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent implements OnInit {
  product: Product | undefined;
  selectedImageIndex: number = 0;
  quantity: number = 1;
  loading: boolean = true;
  activeTab: string = 'description';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private modalService: ModalService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const productId = +params['id'];
      this.loadProduct(productId);
    });
  }

  private loadProduct(id: number): void {
    this.product = this.productService.getProductById(id);
    console.log("product", this.product);
    
    this.loading = false;
    
    if (!this.product) {
      this.router.navigate(['/shop']);
    }
  }

  selectImage(index: number): void {
    this.selectedImageIndex = index;
  }

  openImageModal(): void {
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

  incrementQuantity(): void {
    this.quantity++;
  }

  decrementQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart(): void {
    if (this.product) {
      this.productService.addToCart(this.product);
      // Открываем модальное окно корзины после добавления товара
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

  getDiscountedPrice(): number {
    if (this.product && this.product.discount) {
      return this.product.price * (1 - this.product.discount / 100);
    }
    return this.product?.price || 0;
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }
}