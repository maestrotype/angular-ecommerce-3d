import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { SeoUpdateInterceptor } from './core/interceptors/seo-update.interceptor';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HeaderComponent } from './layout/header/header.component';
import { HeroComponent } from './layout/hero/hero.component';
import { HeroGlassComponent } from './layout/hero-glass/hero-glass.component';
import { CategoriesComponent } from './layout/categories/categories.component';
import { SpecialOfferComponent } from './layout/special-offer/special-offer.component';
import { BestSellersComponent } from './layout/best-sellers/best-sellers.component';
import { BrandsComponent } from './layout/brands/brands.component';
import { FooterComponent } from './layout/footer/footer.component';

import { Bag3dFirstComponent } from './components/3d-models/bag3dFirst/bag3dFirst.component';

import { ContactsComponent } from './pages/contacts/contacts.component';
import { ContactFormComponent } from './shared/components/contact-form/contact-form.component';
import { AboutComponent } from './pages/about/about.component';
import { IconComponent } from './shared/icon/icon.component';

// Modal Components
import { BaseModalComponent } from './shared/modal/base-modal.component';
import { ImageModalComponent } from './shared/modal/image-modal/image-modal.component';
import { CartModalComponent } from './shared/modal/cart-modal/cart-modal.component';
import { AuthModalComponent } from './shared/modal/auth-modal/auth-modal.component';
import { NotificationModalComponent } from './shared/modal/notification-modal/notification-modal.component';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';


// Favorites Components
import { FavoritesComponent } from './pages/favorites/favorites.component';
import { MyOrdersComponent } from './pages/my-orders/my-orders.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';
import { PaymentComponent } from './pages/payment/payment.component';
import { PaymentSuccessComponent } from './pages/payment-success/payment-success.component';
import { PaymentErrorComponent } from './pages/payment-error/payment-error.component';


// Shared Module
import { SharedModule } from './shared/shared.module';

// Services
import { ThemeService } from './core/themes/theme.service';
import { PaymentSettingsService } from './core/services/payment-settings.service';

export function HttpLoaderFactory(http: any) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}


@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    HeroComponent,
    HeroGlassComponent,
    CategoriesComponent,

    SpecialOfferComponent,
    BestSellersComponent,
    BrandsComponent,
    ContactsComponent,
    FooterComponent,

    AboutComponent,
    BaseModalComponent,
    ImageModalComponent,
    CartModalComponent,
    AuthModalComponent,
    NotificationModalComponent,
    Bag3dFirstComponent,
    IconComponent,

    FavoritesComponent,
    MyOrdersComponent,
    ContactFormComponent,
    CheckoutComponent,
    PaymentComponent,
    PaymentSuccessComponent,
    PaymentErrorComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    AppRoutingModule,
    MatIconModule,
    MatButtonModule,
    SharedModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: SeoUpdateInterceptor, multi: true },
    ThemeService,
    PaymentSettingsService,
    provideHttpClient(),
    provideNoopAnimations()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
