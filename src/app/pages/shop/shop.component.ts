import { Component, OnInit } from '@angular/core';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  description: string;
  isSpecial?: boolean;
}

interface Category {
  id: string;
  name: string;
}

@Component({
  selector: 'app-shop',
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.scss']
})
export class ShopComponent implements OnInit {
  
  searchTerm: string = '';
  selectedCategory: string = 'all';
  sortBy: string = 'name';
  viewMode: string = 'grid';
  
  categories: Category[] = [
    { id: 'all', name: 'All Categories' },
    { id: 'handbags', name: 'Handbags' },
    { id: 'shoes', name: 'Shoes' },
    { id: 'clothing', name: 'Clothing' },
    { id: 'accessories', name: 'Accessories' }
  ];

  products: Product[] = [
    {
      id: 1,
      name: 'Quilted Chain Bag',
      price: 299.99,
      image: 'assets/images/bag.png',
      category: 'handbags',
      rating: 4.8,
      description: 'Elegant quilted handbag with golden chain strap'
    },
    {
      id: 2,
      name: 'Minimalist Tote',
      price: 199.99,
      image: 'assets/images/bag-1.png',
      category: 'handbags',
      rating: 4.5,
      description: 'Clean and minimal design tote bag'
    },
    {
      id: 3,
      name: 'Round Crossbody',
      price: 149.99,
      image: 'assets/images/bag-2.png',
      category: 'handbags',
      rating: 4.6,
      description: 'Stylish round crossbody bag with adjustable strap'
    },
    {
      id: 4,
      name: 'Designer Clutch',
      price: 179.99,
      image: 'assets/images/bag-3.png',
      category: 'handbags',
      rating: 4.7,
      description: 'Premium designer clutch for special occasions'
    },
    {
      id: 5,
      name: 'Weekend Tote',
      price: 129.99,
      image: 'assets/images/bag-4.png',
      category: 'handbags',
      rating: 4.4,
      description: 'Spacious weekend tote with multiple compartments',
      isSpecial: true
    },
    {
      id: 6,
      name: 'Classic Shoulder Bag',
      price: 249.99,
      image: 'assets/images/bag-5.png',
      category: 'handbags',
      rating: 4.9,
      description: 'Timeless shoulder bag with premium leather'
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

  addToCart(product: Product): void {
    console.log('Added to cart:', product);
    // Здесь будет логика добавления в корзину
  }

  quickView(product: Product): void {
    console.log('Quick view:', product);
    // Здесь будет логика быстрого просмотра
  }
}