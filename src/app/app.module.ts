import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HeaderComponent } from './layout/header/header.component';
import { HeroComponent } from './layout/hero/hero.component';
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
import { ContactsComponent } from './layout/contacts/contacts.component';
import { AboutComponent } from './pages/about/about.component';
import { IconComponent } from './shared/icon/icon.component';

// Modal Components
import { BaseModalComponent } from './shared/modal/base-modal.component';
import { ImageModalComponent } from './shared/modal/image-modal/image-modal.component';
import { CartModalComponent } from './shared/modal/cart-modal/cart-modal.component';
import { AuthModalComponent } from './shared/modal/auth-modal/auth-modal.component';
import { ProductInfoComponent } from './components/product-detail/product-info/product-info.component';
import { ProductTabsComponent } from './components/product-detail/product-tabs/product-tabs.component';
import { ProductImagesComponent } from './components/product-detail/product-images/product-images.component';


@NgModule({
  declarations: [AppComponent, HeaderComponent, HeroComponent, CategoriesComponent, SpecialOfferComponent, BestSellersComponent, BrandsComponent, ContactsComponent, FooterComponent, HomeComponent, ShopComponent, AboutComponent, ProductDetailComponent, ProductImagesComponent, ProductInfoComponent, ProductTabsComponent, BaseModalComponent, ImageModalComponent, CartModalComponent, AuthModalComponent, Bag3dFirstComponent, IconComponent, ThreeDViewerComponent],
  imports: [BrowserModule, FormsModule, RouterModule, AppRoutingModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
