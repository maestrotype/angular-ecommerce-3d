import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

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
import { HomeComponent } from './pages/home/home.component';
import { ShopComponent } from './pages/shop/shop.component';
import { Bag3dFirstComponent } from './components/3d-models/bag3dFirst/bag3dFirst.component';
import { ThreeDViewerComponent } from './components/three-d-viewer/three-d-viewer.component';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';
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
import { ProductInfoComponent } from './components/product-detail/product-info/product-info.component';
import { ProductTabsComponent } from './components/product-detail/product-tabs/product-tabs.component';
import { ProductImagesComponent } from './components/product-detail/product-images/product-images.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { CustomDropdownComponent } from './shared/custom-dropdown/custom-dropdown.component';
import { SectionRendererComponent } from './components/section-renderer/section-renderer.component';

// Favorites Components
import { FavoritesComponent } from './pages/favorites/favorites.component';

// Shared Module
import { SharedModule } from './shared/shared.module';

// Services
import { ThemeService } from './core/themes/theme.service';


@NgModule({
  declarations: [
    AppComponent, 
    HeaderComponent, 
    HeroComponent, 
    HeroGlassComponent, 
    CategoriesComponent, 
    CustomDropdownComponent, 
    SpecialOfferComponent, 
    BestSellersComponent, 
    BrandsComponent, 
    ContactsComponent, 
    FooterComponent, 
    HomeComponent, 
    ShopComponent, 
    AboutComponent, 
    ProductDetailComponent, 
    ProductImagesComponent, 
    ProductInfoComponent, 
    ProductTabsComponent, 
    BaseModalComponent, 
    ImageModalComponent, 
    CartModalComponent, 
    AuthModalComponent,
    NotificationModalComponent, 
    Bag3dFirstComponent, 
    IconComponent, 
    ThreeDViewerComponent, 
    SectionRendererComponent,
    FavoritesComponent,
    ContactFormComponent
  ],
      imports: [
    BrowserModule, 
    BrowserAnimationsModule, 
    HttpClientModule, 
    FormsModule, 
    ReactiveFormsModule,
    RouterModule, 
    AppRoutingModule,
    MatIconModule,
    MatButtonModule,
    SharedModule
  ],
  providers: [
    provideAnimationsAsync(),
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    ThemeService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
