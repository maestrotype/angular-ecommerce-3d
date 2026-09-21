import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTabsModule } from '@angular/material/tabs';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { LayoutModule } from '@angular/cdk/layout';

import { SharedModule } from '../app/shared/shared.module';
import { ThreeDViewerComponent } from '../app/components/three-d-viewer/three-d-viewer.component';
import { ListContainerComponent } from './components/blocks/list-container/list-container.component';
import { DataTableComponent } from './components/blocks/data-table/data-table.component';
import { AdminTableComponent } from './components/blocks/admin-table/admin-table.component';
import { FormFieldComponent } from './components/ui/form-field/form-field.component';
import { ActionButtonComponent } from './components/ui/action-button/action-button.component';
import { ImageUploadComponent } from './components/ui/image-upload/image-upload.component';
import { ImageProcessorComponent } from './components/ui/image-processor/image-processor.component';
import { ErrorDialogComponent } from './components/error-dialog/error-dialog.component';
import { ConfirmationDialogComponent } from './components/confirmation-dialog/confirmation-dialog.component';
import { SearchBarComponent } from './components/ui/search-bar/search-bar.component';
import { StatCardComponent } from './components/ui/stat-card/stat-card.component';
import { OnboardingDialogComponent } from './components/shared/onboarding-dialog/onboarding-dialog.component';
import { AiWarningDialogComponent } from './components/shared/ai-warning-dialog/ai-warning-dialog.component';

const MATERIAL_MODULES = [
  MatToolbarModule,
  MatSidenavModule,
  MatListModule,
  MatIconModule,
  MatButtonModule,
  MatMenuModule,
  MatBadgeModule,
  MatCardModule,
  MatTableModule,
  MatPaginatorModule,
  MatSortModule,
  MatFormFieldModule,
  MatInputModule,
  MatSelectModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatDialogModule,
  MatSnackBarModule,
  MatProgressSpinnerModule,
  MatChipsModule,
  MatDividerModule,
  MatTooltipModule,
  MatSlideToggleModule,
  MatButtonToggleModule,
  MatTabsModule,
  DragDropModule,
  LayoutModule,
];

const SHARED_COMPONENTS = [
  DataTableComponent,
  AdminTableComponent,
  FormFieldComponent,
  ActionButtonComponent,
  ImageUploadComponent,
  ImageProcessorComponent,
  ErrorDialogComponent,
  ConfirmationDialogComponent,
  SearchBarComponent,
  StatCardComponent,
  OnboardingDialogComponent,
  AiWarningDialogComponent,
];

@NgModule({
  declarations: [...SHARED_COMPONENTS],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TranslateModule,
    SharedModule,
    ThreeDViewerComponent,
    ListContainerComponent,
    ...MATERIAL_MODULES,
  ],
  exports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TranslateModule,
    SharedModule,
    ThreeDViewerComponent,
    ListContainerComponent,
    ...MATERIAL_MODULES,
    ...SHARED_COMPONENTS,
  ],
})
export class AdminSharedModule {}
