import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { ShopComponent } from './shop.component';
import { SharedModule } from '../../shared/shared.module';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ThreeDViewerComponent } from '../../components/three-d-viewer/three-d-viewer.component';
import { SectionRendererComponent } from '../../components/section-renderer/section-renderer.component';
import { TranslateModule } from '@ngx-translate/core';

const routes: Routes = [
  { path: '', component: ShopComponent }
];

@NgModule({
  declarations: [
    ShopComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    MatIconModule,
    MatButtonModule,
    ThreeDViewerComponent,
    SectionRendererComponent,
    TranslateModule,
    RouterModule.forChild(routes)
  ]
})
export class ShopModule { }
