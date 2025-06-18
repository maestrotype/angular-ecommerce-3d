import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
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
import { BagCSS3DComponent } from './components/3d-models/bag3d/BagCSS3D';
import { RealisticBag3DComponent } from './components/realistic-bag-3d/realistic-bag-3d.component';

@NgModule({
  declarations: [AppComponent, HeaderComponent, HeroComponent, BagCSS3DComponent, RealisticBag3DComponent,  CategoriesComponent, SpecialOfferComponent, BestSellersComponent, BrandsComponent, FooterComponent, HomeComponent],
  imports: [BrowserModule, RouterModule, AppRoutingModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
