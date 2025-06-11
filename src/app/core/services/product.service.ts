import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Product } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private productsSubject = new BehaviorSubject<Product[]>([
    { id: 1, name: 'Running Shoes', price: 99.99, imageUrl: 'assets/images/bag.png', category: 'Shoes' },
    { id: 2, name: 'Running Shoes', price: 99.99, imageUrl: 'assets/images/bag.png', category: 'Shoes' },
    { id: 3, name: 'Running Shoes', price: 99.99, imageUrl: 'assets/images/bag.png', category: 'Shoes' },
    { id: 4, name: 'Running Shoes', price: 99.99, imageUrl: 'assets/images/bag.png', category: 'Shoes' },
    { id: 5, name: 'Special Offer Bag', price: 49.99, imageUrl: 'assets/images/bag.png', category: 'Handbags', discount: 30, isSpecial: true }
  ]);
  products$ = this.productsSubject.asObservable();

  getSpecialOffers(): Product[] {
    return this.productsSubject.value.filter(p => p.isSpecial);
  }

  getBestSellers(): Product[] {
    return this.productsSubject.value.slice(0, 4);
  }
}