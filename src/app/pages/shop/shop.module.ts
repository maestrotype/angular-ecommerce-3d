import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ShopComponent } from './shop.component';
import { SharedModule } from '../../shared/shared.module';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ThreeDViewerComponent } from '../../components/three-d-viewer/three-d-viewer.component';
import { CustomDropdownComponent } from '../../shared/custom-dropdown/custom-dropdown.component';

const routes: Routes = [
  { path: '', component: ShopComponent }
];

@NgModule({
  declarations: [
    ShopComponent,
    ThreeDViewerComponent,
    CustomDropdownComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    MatIconModule,
    MatButtonModule,
    RouterModule.forChild(routes)
  ]
})
export class ShopModule { }
