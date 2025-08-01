import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { BaseButtonComponent } from './ui/buttons/base-button/base-button.component';
import { ProductCardComponent } from './ui/cards/product-card/product-card.component';
import { FavoriteButtonComponent } from './favorite-button/favorite-button.component';
import { NotificationModalComponent } from './modal/notification-modal/notification-modal.component';

@NgModule({
  declarations: [
    BaseButtonComponent,
    ProductCardComponent,
    FavoriteButtonComponent,
    NotificationModalComponent
  ],
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule
  ],
  exports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    BaseButtonComponent,
    ProductCardComponent,
    FavoriteButtonComponent,
    NotificationModalComponent
  ]
})
export class SharedModule { } 