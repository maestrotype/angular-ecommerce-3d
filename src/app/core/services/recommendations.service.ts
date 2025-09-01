import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { catchError, tap, shareReplay, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment.prod';
import { NotificationService } from './notification.service';

export interface RecommendationProduct {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  category: string;
  rating?: number;
  discount?: number;
  isSpecial?: boolean;
  isNew?: boolean;
  originalPrice?: number;
  stock?: number;
  isFavorite?: boolean;
  userRating?: number;
  ratingCount?: number;
  score: number;
}

export interface SimilarProductsResponse {
  success: boolean;
  data: {
    productId: number;
    similarProducts: RecommendationProduct[];
  };
  error?: string;
}

export interface BoughtTogetherResponse {
  success: boolean;
  data: {
    productId: number;
    boughtTogetherProducts: RecommendationProduct[];
  };
  error?: string;
}

export interface PersonalizedRecommendationsResponse {
  success: boolean;
  data: {
    userId?: number;
    recommendations: RecommendationProduct[];
  };
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RecommendationsService {
  private readonly API_URL = environment.apiUrl;
  
  private similarProductsCache = new Map<number, RecommendationProduct[]>();
  private boughtTogetherCache = new Map<number, RecommendationProduct[]>();
  private personalizedCache = new BehaviorSubject<RecommendationProduct[]>([]);
  
  // Flag to prevent duplicate notifications
  private isShowingError = false;
  
  constructor(
    private http: HttpClient,
    private notificationService: NotificationService
  ) {}

  getSimilarProducts(productId: number, limit: number = 4): Observable<RecommendationProduct[]> {
    // Check cache first
    const cached = this.similarProductsCache.get(productId);
    if (cached) {
      return of(cached);
    }

    return this.http.get<any>(`${this.API_URL}/recommendations/similar/${productId}?limit=${limit}`).pipe(
      map(response => {
        console.log('Similar products response:', response);
        
        if (!response.success) {
          throw new Error(response.error || 'Failed to get similar products');
        }
        
        // Backend returns { data: { similarProducts: [...] } }
        const products = response.data?.similarProducts || [];
        console.log('Extracted similar products:', products);
        
        return products;
      }),
      tap(products => {
        // Cache the results
        this.similarProductsCache.set(productId, products);
        // Reset error flag on success
        this.isShowingError = false;
      }),
      catchError(error => {
        console.error('Error fetching similar products:', error);
        
        // Only show notification if not already showing
        if (!this.isShowingError) {
          this.isShowingError = true;
          this.notificationService.showError(
            'Unable to load similar products. Please try again later.',
            5000
          );
        }
        
        return of([]);
      }),
      shareReplay(1)
    );
  }

  getBoughtTogetherProducts(productId: number, limit: number = 4): Observable<RecommendationProduct[]> {
    // Check cache first
    const cached = this.boughtTogetherCache.get(productId);
    if (cached) {
      return of(cached);
    }

    return this.http.get<any>(`${this.API_URL}/recommendations/bought-together/${productId}?limit=${limit}`).pipe(
      map(response => {
        console.log('Bought together response:', response);
        
        if (!response.success) {
          throw new Error(response.error || 'Failed to get bought together products');
        }
        
        // Backend returns { data: { boughtTogetherProducts: [...] } }
        const products = response.data?.boughtTogetherProducts || [];
        console.log('Extracted bought together products:', products);
        
        return products;
      }),
      tap(products => {
        // Cache the results
        this.boughtTogetherCache.set(productId, products);
        // Reset error flag on success
        this.isShowingError = false;
      }),
      catchError(error => {
        console.error('Error fetching bought together products:', error);
        
        // Only show notification if not already showing
        if (!this.isShowingError) {
          this.isShowingError = true;
          this.notificationService.showError(
            'Unable to load frequently bought together products. Please try again later.',
            5000
          );
        }
        
        return of([]);
      }),
      shareReplay(1)
    );
  }

  getPersonalizedRecommendations(userId?: number, limit: number = 8): Observable<RecommendationProduct[]> {
    const params = userId ? `?userId=${userId}&limit=${limit}` : `?limit=${limit}`;
    
    return this.http.get<PersonalizedRecommendationsResponse>(`${this.API_URL}/recommendations/personalized${params}`).pipe(
      map(response => {
        if (!response.success) {
          throw new Error(response.error || 'Failed to get personalized recommendations');
        }
        return response.data?.recommendations || [];
      }),
      tap(products => {
        // Update cache
        this.personalizedCache.next(products);
        // Reset error flag on success
        this.isShowingError = false;
      }),
      catchError(error => {
        console.error('Error fetching personalized recommendations:', error);
        
        // Only show notification if not already showing
        if (!this.isShowingError) {
          this.isShowingError = true;
          this.notificationService.showError(
            'Unable to load personalized recommendations. Please try again later.',
            5000
          );
        }
        
        return of([]);
      }),
      shareReplay(1)
    );
  }

  getPersonalizedRecommendations$(): Observable<RecommendationProduct[]> {
    return this.personalizedCache.asObservable();
  }

  clearCache(): void {
    this.similarProductsCache.clear();
    this.boughtTogetherCache.clear();
    this.personalizedCache.next([]);
  }

  clearProductCache(productId: number): void {
    this.similarProductsCache.delete(productId);
    this.boughtTogetherCache.delete(productId);
  }

  // Error handling utilities
  private handleRecommendationError(error: any, context: string): void {
    let userMessage = 'An error occurred while loading recommendations.';
    
    if (error.status === 404) {
      userMessage = 'Product not found for recommendations.';
    } else if (error.status === 422) {
      userMessage = 'Not enough data to show recommendations.';
    } else if (error.status === 429) {
      userMessage = 'Too many requests. Please wait a moment before trying again.';
    } else if (error.status >= 500) {
      userMessage = 'Service temporarily unavailable. Please try again later.';
    } else if (error.message) {
      userMessage = error.message;
    }

    this.notificationService.showError(userMessage, 5000);
    console.error(`Recommendation error in ${context}:`, error);
  }
} 