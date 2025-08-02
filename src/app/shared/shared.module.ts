import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { BaseButtonComponent } from './ui/buttons/base-button/base-button.component';
import { ProductCardComponent } from './ui/cards/product-card/product-card.component';
import { FavoriteButtonComponent } from './favorite-button/favorite-button.component';
import { TestButtonComponent } from './components/test-button/test-button.component';

@NgModule({
  declarations: [
    BaseButtonComponent,
    ProductCardComponent,
    FavoriteButtonComponent,
    TestButtonComponent
  ],
  imports: [
    CommonModule,
    MatIconModule
  ],
  exports: [
    CommonModule,
    BaseButtonComponent,
    ProductCardComponent,
    FavoriteButtonComponent,
    TestButtonComponent
  ]
})
export class SharedModule { } 