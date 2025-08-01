import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Product } from 'src/shared/models/product.model';

import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { CartService } from '../../core/services/cart.service';
import { FavoritesService } from '../../core/services/favorites.service';
import { NotificationService } from '../../core/services/notification.service';
import { CartItem } from 'src/shared/models/cart-item.model';
import { Category } from 'src/shared/models/category.model';

interface DropdownOption {
  value: string;
  label: string;
}

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

  // Pagination
  currentPage: number = 1;
  pageSize: number = 8;
  totalPages: number = 1;
  paginatedProducts: Product[] = [];

  // Dropdown options
  categoryOptions: DropdownOption[] = [];
  sortOptions: DropdownOption[] = [
    { value: 'name', label: 'Sort by Name' },
    { value: 'price', label: 'Sort by Price' },
    { value: 'rating', label: 'Sort by Rating' }
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    private favoritesService: FavoritesService,
    private categoryService: CategoryService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.categoryService.getAllCategories().subscribe(categories => {
      this.categories = categories;
      this.categoryOptions = [
        { value: 'all', label: 'All categories' },
        ...categories.map(cat => ({ value: cat.name, label: cat.name }))
      ];
    });

    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.filterProducts();
      },
      error: (err) => { console.log(err); }
    });
    
    this.route.queryParams.subscribe(params => {
      if (params['search']) {
        this.searchTerm = params['search'];
      }
      if (params['category']) {
        this.selectedCategory = params['category'];
      }
      this.filterProducts();
    });
  }

  onSearchChange(): void {
    this.filterProducts();
  }

  onCategoryChange(value: string): void {
    this.selectedCategory = value;
    this.currentPage = 1;
    this.filterProducts();
  }

  onSortChange(value: string): void {
    this.sortBy = value;
    this.currentPage = 1;
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
    this.totalPages = Math.max(1, Math.ceil(filtered.length / this.pageSize));
    this.currentPage = Math.min(this.currentPage, this.totalPages);
    this.paginateProducts();
  }

  paginateProducts(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedProducts = this.filteredProducts.slice(start, end);
  }

  goToPage(page: number): void {
    console.log('goToPage called with:', page, 'totalPages:', this.totalPages);
    if (page < 1 || page > this.totalPages) {
      console.log('Invalid page number');
      return;
    }
    this.currentPage = page;
    this.paginateProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    console.log('Current page set to:', this.currentPage);
  }

  nextPage(): void {
    console.log('nextPage called, currentPage:', this.currentPage, 'totalPages:', this.totalPages);
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.paginateProducts();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      console.log('Moved to next page:', this.currentPage);
    } else {
      console.log('Already on last page');
    }
  }

  prevPage(): void {
    console.log('prevPage called, currentPage:', this.currentPage);
    if (this.currentPage > 1) {
      this.currentPage--;
      this.paginateProducts();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      console.log('Moved to previous page:', this.currentPage);
    } else {
      console.log('Already on first page');
    }
  }

  goToProductDetail(productId: number): void {
    this.router.navigate(['/product', productId]).then(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  addToCart(product: Product): void {
    const cartItem: Omit<CartItem, 'quantity'> = {
      productId: product.id,
      name: product.name,
      price: this.getDiscountedPrice(product),
      imageUrl: product.imageUrl,
      discount: product.discount,
      features: product.features,
      specifications: product.specifications,
    };
  
    for (let i = 0; i < this.quantity; i++) {
      this.cartService.addToCart(cartItem);
    }
  
    this.notificationService.showSuccess(`Added ${this.quantity} ${product.name} to cart!`);
  }

  getDiscountedPrice(product: Product): number {
    if (product && product.discount) {
      return product.price * (1 - product.discount / 100);
    }
    return product?.price || 0;
  }

  quickView(product: Product): void {
    console.log('Quick view:', product);
  }

  /**
   * Handle favorite toggle events
   */
  onFavoriteToggled(event: { product: Product; isFavorite: boolean }): void {
    // The FavoritesService already handles the toggle logic
    // This method can be used for additional UI feedback if needed
    console.log(`${event.product.name} ${event.isFavorite ? 'added to' : 'removed from'} favorites`);
  }
}