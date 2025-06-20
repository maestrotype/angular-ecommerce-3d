import { Component, OnInit } from '@angular/core';

export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  rating: number;
  image: string;
  description?: string;
}

export interface Category {
  id: string;
  name: string;
}

@Component({
  selector: 'app-catalog',
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.scss']
})
export class CatalogComponent implements OnInit {
  searchTerm: string = '';
  selectedCategory: string = 'all';
  sortBy: string = 'name';
  viewMode: string = 'grid';

  categories: Category[] = [
    { id: 'all', name: 'All Products' },
    { id: 'shoes', name: 'Shoes' },
    { id: 'handbags', name: 'Handbags' },
    { id: 'clothing', name: 'Clothing' },
    { id: 'accessories', name: 'Accessories' }
  ];

  products: Product[] = [
    {
      id: 1,
      name: 'Premium Running Shoes',
      price: 129.99,
      category: 'shoes',
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop',
      description: 'High-quality running shoes for professional athletes'
    },
    {
      id: 2,
      name: 'Designer Leather Handbag',
      price: 349.99,
      category: 'handbags',
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=300&h=300&fit=crop',
      description: 'Elegant leather handbag for special occasions'
    },
    {
      id: 3,
      name: 'Cotton T-Shirt',
      price: 39.99,
      category: 'clothing',
      rating: 4.3,
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop',
      description: 'Comfortable cotton t-shirt for everyday wear'
    },
    {
      id: 4,
      name: 'Luxury Watch',
      price: 599.99,
      category: 'accessories',
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop',
      description: 'Swiss-made luxury watch with premium materials'
    },
    {
      id: 5,
      name: 'Classic Leather Boots',
      price: 199.99,
      category: 'shoes',
      rating: 4.6,
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&h=300&fit=crop',
      description: 'Durable leather boots for all seasons'
    },
    {
      id: 6,
      name: 'Evening Clutch',
      price: 149.99,
      category: 'handbags',
      rating: 4.4,
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=300&fit=crop',
      description: 'Elegant evening clutch for special events'
    },
    {
      id: 7,
      name: 'Silk Dress',
      price: 289.99,
      category: 'clothing',
      rating: 4.5,
      image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=300&h=300&fit=crop',
      description: 'Luxurious silk dress for formal occasions'
    },
    {
      id: 8,
      name: 'Diamond Earrings',
      price: 799.99,
      category: 'accessories',
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300&h=300&fit=crop',
      description: 'Beautiful diamond earrings with premium setting'
    }
  ];

  filteredProducts: Product[] = [];

  constructor() { }

  ngOnInit(): void {
    this.filterProducts();
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
    this.filteredProducts = this.products
      .filter(product => 
        (this.selectedCategory === 'all' || product.category === this.selectedCategory) &&
        product.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        switch (this.sortBy) {
          case 'price':
            return a.price - b.price;
          case 'rating':
            return b.rating - a.rating;
          default:
            return a.name.localeCompare(b.name);
        }
      });
  }

  addToCart(product: Product): void {
    console.log('Adding to cart:', product);
    // Здесь будет логика добавления в корзину
  }
}