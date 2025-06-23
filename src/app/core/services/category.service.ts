import { Injectable } from '@angular/core';
import { Category } from '../models/Category';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private categories: Category[] = [
    { id: 'all', name: 'All Categories' },
    { id: 'handbags', name: 'Handbags', iconUrl: 'assets/icons/handbags.svg' },
    { id: 'shoes', name: 'Shoes', iconUrl: 'assets/icons/shoes.svg' },
    { id: 'clothing', name: 'Clothing', iconUrl: 'assets/icons/clothing.svg'}
  ];

  constructor() { }

  getCategories(): Category[] {
    return this.categories;
  }

  getCategoryById(id: string): Category | undefined {
    return this.categories.find(category => category.id === id);
  }
}