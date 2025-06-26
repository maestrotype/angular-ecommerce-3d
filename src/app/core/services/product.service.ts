import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Product } from '../models';
@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private productsSubject = new BehaviorSubject<Product[]>([
    {
      id: 1,
      name: 'Quilted Chain Bag',
      price: 299.99,
      imageUrl: 'assets/images/bag-w/img1.png',
      category: 'handbags',
      rating: 4.8,
      description: 'Elegant quilted handbag with golden chain strap. Perfect for both casual and formal occasions.',
      images: [
        'assets/images/bag-w/img1.png',
        'assets/images/bag-w/img2.jpg',
        'assets/images/bag-w/img3.jpg',
        'assets/images/bag-w/img4.jpg',
      ],
      features: [
        'Premium quilted leather',
        'Adjustable chain strap',
        'Multiple compartments',
        'Magnetic closure'
      ],
      specifications: {
        'Material': 'Genuine Leather',
        'Dimensions': '25cm x 15cm x 8cm',
        'Weight': '0.8kg',
        'Color': 'Classic Black'
      }
    },
    {
      id: 2,
      name: 'Minimalist Tote',
      price: 199.99,
      imageUrl: 'assets/images/bag3/img1.png',
      category: 'handbags',
      rating: 4.5,
      description: 'Clean and minimal design tote bag for everyday use',
      images: [
        'assets/images/bag3/img1.png',
        'assets/images/bag3/img2.jpg',
        'assets/images/bag3/img3.jpg',
        'assets/images/bag3/img4.jpg',
      ],
      features: [
        'Minimalist design',
        'Spacious interior',
        'Durable handles',
        'Inner pocket'
      ],
      specifications: {
        'Material': 'Canvas',
        'Dimensions': '35cm x 30cm x 10cm',
        'Weight': '0.6kg',
        'Color': 'Beige'
      }
    },
    {
      id: 3,
      name: 'Round Crossbody',
      price: 149.99,
      imageUrl: 'assets/images/bag2/img1.png',
      category: 'handbags',
      rating: 4.6,
      description: 'Stylish round crossbody bag with adjustable strap',
      images: [
        'assets/images/bag2/img1.png',
        'assets/images/bag2/img2.jpg',
        'assets/images/bag3/img3.jpg',
        'assets/images/bag2/img4.jpg',
      ],
      features: [
        'Unique round design',
        'Adjustable strap',
        'Compact size',
        'Zip closure'
      ],
      specifications: {
        'Material': 'Synthetic Leather',
        'Dimensions': '20cm x 20cm x 5cm',
        'Weight': '0.4kg',
        'Color': 'Black'
      }
    },
    {
      id: 4,
      name: 'Designer Clutch',
      price: 179.99,
      imageUrl: 'assets/images/bag1/img1.png',
      category: 'handbags',
      rating: 4.7,
      description: 'Premium designer clutch for special occasions',
      images: [
        'assets/images/bag1/img1.png',
        'assets/images/bag1/img2.jpg',
        'assets/images/bag1/img3.jpg',
        'assets/images/bag1/img4.jpg',
      ],
      features: [
        'Designer style',
        'Premium materials',
        'Elegant design',
        'Perfect for events'
      ],
      specifications: {
        'Material': 'Patent Leather',
        'Dimensions': '30cm x 18cm x 3cm',
        'Weight': '0.5kg',
        'Color': 'Red'
      }
    },
    {
      id: 5,
      name: 'Weekend Tote',
      price: 129.99,
      imageUrl: 'assets/images/bag-g/img1.png',
      category: 'handbags',
      rating: 4.4,
      description: 'Spacious weekend tote with multiple compartments',
      isSpecial: true,
      discount: 20,
      images: [
        'assets/images/bag-g/img1.png',
        'assets/images/bag-g/img2.jpg',
        'assets/images/bag-g/img3.jpg',
        'assets/images/bag-g/img4.jpg',
      ],
      features: [
        'Extra spacious',
        'Multiple compartments',
        'Weekend ready',
        'Comfortable handles'
      ],
      specifications: {
        'Material': 'Canvas & Leather',
        'Dimensions': '40cm x 35cm x 15cm',
        'Weight': '1.2kg',
        'Color': 'Brown'
      }
    },
    {
      id: 6,
      name: 'Classic Shoulder Bag',
      price: 249.99,
      imageUrl: 'assets/images/bag-w/img1.png',
      category: 'handbags',
      rating: 4.9,
      description: 'Timeless shoulder bag with premium leather',
      images: [
        'assets/images/bag-w/img1.png',
        'assets/images/bag-w/img2.jpg',
        'assets/images/bag-w/img3.jpg',
        'assets/images/bag-w/img4.jpg',
      ],
      features: [
        'Premium leather',
        'Classic design',
        'Adjustable strap',
        'Multiple pockets'
      ],
      specifications: {
        'Material': 'Premium Leather',
        'Dimensions': '28cm x 22cm x 12cm',
        'Weight': '0.9kg',
        'Color': 'Black'
      }
    }
  ]);

  products$ = this.productsSubject.asObservable();

  constructor() { }

  private cartSubject = new BehaviorSubject<Product[]>([]);
  cart$ = this.cartSubject.asObservable();

  getProducts(): Product[] {
    return this.productsSubject.value;
  }

  getProductById(id: number): Product | undefined {
    return this.productsSubject.value.find(product => product.id === id);
  }

  getSpecialOffers(): Product[] {
    return this.productsSubject.value.filter(p => p.isSpecial);
  }

  getBestSellers(): Product[] {
    return this.productsSubject.value.slice(0, 4);
  }

  searchProducts(searchTerm: string): Product[] {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return [];

    return this.productsSubject.value.filter(product => 
      product.name.toLowerCase().includes(term) ||
      (product.description && product.description.toLowerCase().includes(term)) ||
      (product.category && product.category.toLowerCase().includes(term)) ||
      (product.features && product.features.some(feature => 
        feature.toLowerCase().includes(term)
      ))
    );
  }

  addToCart(product: Product) {
    const currentCart = this.cartSubject.value;
    this.cartSubject.next([...currentCart, product]);
  }

  getCart(): Product[] {
    return this.cartSubject.value;
  }

  clearCart() {
    this.cartSubject.next([]);
  }
}