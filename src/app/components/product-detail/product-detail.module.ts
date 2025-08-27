import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { SharedModule } from '../../shared/shared.module';
import { ProductDetailComponent } from './product-detail.component';
import { ProductImagesComponent } from './product-images/product-images.component';
import { ProductInfoComponent } from './product-info/product-info.component';
import { ProductTabsComponent } from './product-tabs/product-tabs.component';

const routes: Routes = [
  { path: '', component: ProductDetailComponent }
];

@NgModule({
  declarations: [
    ProductDetailComponent,
    ProductImagesComponent,
    ProductInfoComponent,
    ProductTabsComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    MatIconModule,
    MatButtonModule,
    RouterModule.forChild(routes)
  ]
})
export class ProductDetailModule { }


