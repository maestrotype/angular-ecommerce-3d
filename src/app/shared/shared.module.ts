import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { BaseButtonComponent } from './ui/buttons/base-button/base-button.component';
import { ProductCardComponent } from './ui/cards/product-card/product-card.component';
import { FavoriteButtonComponent } from './favorite-button/favorite-button.component';
import { CustomDropdownComponent } from './custom-dropdown/custom-dropdown.component';
// Recommendation Components
import { SimilarProductsComponent } from './components/recommendations/similar-products/similar-products.component';
import { BoughtTogetherComponent } from './components/recommendations/bought-together/bought-together.component';
// Payment Components
import { StripeElementsComponent } from './components/stripe-elements/stripe-elements.component';
import { StripeTestComponent } from '../pages/stripe-test/stripe-test.component';
import { SectionRendererComponent } from '../components/section-renderer/section-renderer.component';
import { NotificationBadgeComponent } from './components/notification-badge/notification-badge.component';
import { LocPipe } from './pipes/loc.pipe';

@NgModule({
  declarations: [
    BaseButtonComponent,
    ProductCardComponent,
    FavoriteButtonComponent,
    CustomDropdownComponent,
    SimilarProductsComponent,
    BoughtTogetherComponent,
    StripeElementsComponent,
    StripeTestComponent,
    SectionRendererComponent,
    NotificationBadgeComponent,
    LocPipe
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
    CustomDropdownComponent,
    SimilarProductsComponent,
    BoughtTogetherComponent,
    StripeElementsComponent,
    StripeTestComponent,
    SectionRendererComponent,
    NotificationBadgeComponent,
    LocPipe
  ]
})
export class SharedModule { } 