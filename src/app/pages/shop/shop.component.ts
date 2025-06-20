import { Component } from '@angular/core';
import { Product } from 'src/app/core/models/Product';
import { ProductService } from 'src/app/core/services/product.service';


@Component({
  selector: 'app-shop',
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.scss'
})
export class ShopComponent {
  products: Product[] = [];

  constructor(private productService: ProductService) {
    this.products = this.productService.getProducts();
  }

  addToCart(product: Product) {
    this.productService.addToCart(product);
  }
}
