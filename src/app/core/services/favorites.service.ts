import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { Product } from 'src/shared/models/product.model';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private readonly API_URL = environment.apiUrl;
  private readonly STORAGE_KEY = 'favorites';
  
  // Reactive state management using BehaviorSubject
  private favoritesSubject = new BehaviorSubject<Product[]>([]);
  public favorites$ = this.favoritesSubject.asObservable();
  
  // Computed observables
  public favoritesCount$ = this.favorites$.pipe(
    map(favorites => favorites.length)
  );
  
  public isFavorite$ = (productId: number) => this.favorites$.pipe(
    map(favorites => favorites.some(fav => fav.id === productId))
  );

  constructor(private http: HttpClient) {
    this.loadFavoritesFromStorage();
  }

  /**
   * Add product to favorites
   */
  addToFavorites(product: Product): void {
    const currentFavorites = this.favoritesSubject.value;
    const isAlreadyFavorite = currentFavorites.some(fav => fav.id === product.id);
    
    if (!isAlreadyFavorite) {
      const updatedFavorites = [...currentFavorites, { ...product, isFavorite: true }];
      this.updateFavorites(updatedFavorites);
      
      // Sync with backend if user is authenticated
      this.syncWithBackend(product.id, 'add');
    }
  }

  /**
   * Remove product from favorites
   */
  removeFromFavorites(productId: number): void {
    const currentFavorites = this.favoritesSubject.value;
    const updatedFavorites = currentFavorites.filter(fav => fav.id !== productId);
    this.updateFavorites(updatedFavorites);
    
    // Sync with backend if user is authenticated
    this.syncWithBackend(productId, 'remove');
  }

  /**
   * Toggle favorite status
   */
  toggleFavorite(product: Product): void {
    const isFavorite = this.favoritesSubject.value.some(fav => fav.id === product.id);
    
    if (isFavorite) {
      this.removeFromFavorites(product.id);
    } else {
      this.addToFavorites(product);
    }
  }

  /**
   * Check if product is in favorites
   */
  isFavorite(productId: number): boolean {
    return this.favoritesSubject.value.some(fav => fav.id === productId);
  }

  /**
   * Get all favorite products
   */
  getFavorites(): Product[] {
    return this.favoritesSubject.value;
  }

  /**
   * Clear all favorites
   */
  clearFavorites(): void {
    this.updateFavorites([]);
  }

  /**
   * Update favorites state and persist to storage
   */
  private updateFavorites(favorites: Product[]): void {
    this.favoritesSubject.next(favorites);
    this.saveFavoritesToStorage(favorites);
  }

  /**
   * Load favorites from localStorage
   */
  private loadFavoritesFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const favorites = JSON.parse(stored);
        this.favoritesSubject.next(favorites);
      }
    } catch (error) {
      console.error('Error loading favorites from storage:', error);
    }
  }

  /**
   * Save favorites to localStorage
   */
  private saveFavoritesToStorage(favorites: Product[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(favorites));
    } catch (error) {
      console.error('Error saving favorites to storage:', error);
    }
  }

  /**
   * Sync with backend API
   */
  private syncWithBackend(productId: number, action: 'add' | 'remove'): void {
    // TODO: Implement backend sync when user is authenticated
    // For now, we'll just use localStorage
  }

  /**
   * Load favorites from backend (for authenticated users)
   */
  loadFavoritesFromBackend(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.API_URL}/favorites`).pipe(
      map(favorites => {
        const favoritesWithFlag = favorites.map(fav => ({ ...fav, isFavorite: true }));
        this.updateFavorites(favoritesWithFlag);
        return favoritesWithFlag;
      })
    );
  }
} 