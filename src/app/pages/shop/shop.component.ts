import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Product } from '../../core/models/Product';
import { Category } from '../../core/models/Category';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-shop',
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.scss']
})
export class ShopComponent implements OnInit {
  @Input() product!: Product;
  @Input() quantity: number = 1;
  searchTerm: string = '';
  selectedCategory: string = 'all';
  sortBy: string = 'name';
  viewMode: string = 'grid';

  categories: Category[] = [];
  products: Product[] = [];
  filteredProducts: Product[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    private categoryService: CategoryService
  ) { }

  ngOnInit(): void {
    this.categories = this.categoryService.getCategories();

    this.productService.getProducts().subscribe({
      next: (products) => this.products = products,
      error: (err) => { console.log(err);
       }
    });
    
    this.route.queryParams.subscribe(params => {
      if (params['search']) {
        this.searchTerm = params['search'];
      }
      this.filterProducts();
    });
  }

  onSearchChange(): void {
    this.filterProducts();
  }

  onCategoryChange(): void {
    this.filterProducts();
  }

  onSortChange(): void {
    this.filterProducts();
  }

  changeViewMode(mode: string): void {
    this.viewMode = mode;
  }

  private filterProducts(): void {
    let filtered = [...this.products];

    // Filter by search term
    if (this.searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === this.selectedCategory);
    }

    // Sort products
    switch (this.sortBy) {
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'price':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
    }

    this.filteredProducts = filtered;
  }

  goToProductDetail(productId: number): void {
    this.router.navigate(['/product', productId]).then(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  addToCart(product: Product): void {
    const cartItem = {
      id: this.product.id,
      name: this.product.name,
      price: this.getDiscountedPrice(),
      image: this.product.imageUrl,
      originalPrice: this.product.discount ? this.product.price : undefined,
      discount: this.product.discount
    };

    for (let i = 0; i < this.quantity; i++) {
      this.cartService.addToCart(cartItem);
    }

    // Show success message (you can integrate with a toast service)
    alert(`Added ${this.quantity} ${this.product.name} to cart!`);
  }

  getDiscountedPrice(): number {
    if (this.product && this.product.discount) {
      return this.product.price * (1 - this.product.discount / 100);
    }
    return this.product?.price || 0;
  }

  quickView(product: Product): void {
    console.log('Quick view:', product);
  }
}