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

@NgModule({
  declarations: [AppComponent, HeaderComponent, HeroComponent, CategoriesComponent, SpecialOfferComponent, BestSellersComponent, BrandsComponent, ContactsComponent, FooterComponent, HomeComponent, ShopComponent, ProductDetailComponent, Bag3dFirstComponent, ThreeDViewerComponent],
  imports: [BrowserModule, FormsModule, RouterModule, AppRoutingModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
