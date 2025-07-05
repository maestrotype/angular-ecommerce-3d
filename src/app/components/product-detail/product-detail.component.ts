import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { ModalService } from '../../core/services/modal.service';
import { Product } from 'src/shared/models/product.model';
import { CartService } from 'src/app/core/services/cart.service';

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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService,
    private modalService: ModalService
  ) { }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.productService.getProductById(id).subscribe({
        next: (product) => {
          this.product = product;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.router.navigate(['/shop']);
        }
      });
    } else {
      this.router.navigate(['/shop']);
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
        price: this.product.price,
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
}