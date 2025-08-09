import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { BaseButtonComponent } from './ui/buttons/base-button/base-button.component';
import { ProductCardComponent } from './ui/cards/product-card/product-card.component';
import { FavoriteButtonComponent } from './favorite-button/favorite-button.component';
// Recommendation Components
import { SimilarProductsComponent } from './components/recommendations/similar-products/similar-products.component';
import { BoughtTogetherComponent } from './components/recommendations/bought-together/bought-together.component';

@NgModule({
  declarations: [
    BaseButtonComponent,
    ProductCardComponent,
    FavoriteButtonComponent,
    SimilarProductsComponent,
    BoughtTogetherComponent
  ],
  imports: [
    CommonModule,
    MatIconModule
  ],
  providers: [
    DecimalPipe
  ],
  exports: [
    CommonModule,
    BaseButtonComponent,
    ProductCardComponent,
    FavoriteButtonComponent,
    SimilarProductsComponent,
    BoughtTogetherComponent
  ]
})
export class SharedModule { } 