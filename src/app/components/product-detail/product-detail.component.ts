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
    // В реальном приложении здесь был бы HTTP запрос
    this.product = this.productService.getProductById(id);
    console.log("product", this.product);
    
    this.loading = false;
    
    if (!this.product) {
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
}