import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';

import { SeoRoutingModule } from './seo-routing.module';
import { SeoComponent } from './seo.component';
import { AdminSeoService } from '../../../app/core/services/admin-seo.service';
import { ListContainerComponent } from '../../components/blocks/list-container/list-container.component';

@NgModule({
  declarations: [
    SeoComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SeoRoutingModule,
    ListContainerComponent,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatSelectModule,
    MatDividerModule,
    MatSnackBarModule,
    MatTabsModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    TranslateModule
  ],
  providers: [
    AdminSeoService
  ]
})
export class SeoModule { } 