import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { Product } from 'src/shared/models/product.model';
import { FavoritesService } from '../../core/services/favorites.service';

@Component({
  selector: 'app-favorite-button',
  templateUrl: './favorite-button.component.html',
  styleUrls: ['./favorite-button.component.scss']
})
export class FavoriteButtonComponent implements OnInit, OnDestroy {
  @Input() product!: Product;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() showText = false;
  @Output() favoriteToggled = new EventEmitter<{ product: Product; isFavorite: boolean }>();

  isFavorite = false;
  isLoading = false;
  
  private destroy$ = new Subject<void>();

  constructor(private favoritesService: FavoritesService) {}

  ngOnInit(): void {
    if (this.product) {
      // Subscribe to favorite status changes
      this.favoritesService.isFavorite$(this.product.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe(isFavorite => {
          this.isFavorite = isFavorite;
        });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Handle favorite button click
   */
  onFavoriteClick(event: Event): void {
    event.stopPropagation(); // Prevent event bubbling
    
    if (!this.product) return;
    
    this.isLoading = true;
    
    // Toggle favorite status
    this.favoritesService.toggleFavorite(this.product);
    
    // Emit event for parent components
    this.favoriteToggled.emit({
      product: this.product,
      isFavorite: !this.isFavorite
    });
    
    // Reset loading state after animation
    setTimeout(() => {
      this.isLoading = false;
    }, 300);
  }

  /**
   * Get CSS classes for the button
   */
  get buttonClasses(): string {
    const classes = ['favorite-button'];
    
    if (this.size) {
      classes.push(`favorite-button--${this.size}`);
    }
    
    if (this.isFavorite) {
      classes.push('favorite-button--active');
    }
    
    if (this.isLoading) {
      classes.push('favorite-button--loading');
    }
    
    return classes.join(' ');
  }
} 