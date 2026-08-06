import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { EmptyStateComponent } from './ui/empty-state/empty-state.component';
import { LoadingSpinnerComponent } from './ui/loading-spinner/loading-spinner.component';
import { SkeletonLoaderComponent } from './ui/skeleton-loader/skeleton-loader.component';
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
import { LogoComponent } from './components/logo/logo.component';
import { IconComponent } from './icon/icon.component';
import { ReplaceSpacesPipe } from '@app-shared/pipes/replace-spaces.pipe';
import { LocalizedPipe } from '@app-shared/pipes/localized.pipe';
import { ImageUrlPipe } from '@app-shared/pipes/image-url.pipe';

@NgModule({
  declarations: [
    BaseButtonComponent,
    EmptyStateComponent,
    LoadingSpinnerComponent,
    SkeletonLoaderComponent,
    ProductCardComponent,
    FavoriteButtonComponent,
    CustomDropdownComponent,
    SimilarProductsComponent,
    BoughtTogetherComponent,
    StripeElementsComponent,
    StripeTestComponent,
    ReplaceSpacesPipe,
    NotificationBadgeComponent,
    LogoComponent,
    IconComponent
  ],
  imports: [
    CommonModule,
    MatIconModule,
    TranslateModule,
    LocalizedPipe,
    ImageUrlPipe,
    SectionRendererComponent
  ],

  providers: [
    DecimalPipe
  ],
  exports: [
    CommonModule,
    BaseButtonComponent,
    EmptyStateComponent,
    LoadingSpinnerComponent,
    SkeletonLoaderComponent,
    ProductCardComponent,
    FavoriteButtonComponent,
    CustomDropdownComponent,
    SimilarProductsComponent,
    BoughtTogetherComponent,
    StripeElementsComponent,
    StripeTestComponent,
    SectionRendererComponent,
    NotificationBadgeComponent,
    LogoComponent,
    IconComponent,
    ReplaceSpacesPipe,
    LocalizedPipe,
    ImageUrlPipe,
    TranslateModule
  ]
})
export class SharedModule { } 