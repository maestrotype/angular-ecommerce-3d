import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
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
import { DragDropModule } from '@angular/cdk/drag-drop';
import { LayoutModule } from '@angular/cdk/layout';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminLayoutComponent } from './components/layout/admin-layout/admin-layout.component';
import { AdminLoginComponent } from './pages/login/admin-login.component';
import { SidenavComponent } from './components/layout/sidenav/sidenav.component';
import { HeaderComponent } from './components/layout/header/header.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ProductListComponent } from './pages/products/product-list/product-list.component';
import { ProductFormComponent } from './pages/products/product-form/product-form.component';
import { CategoryListComponent } from './pages/categories/category-list/category-list.component';
import { OrderListComponent } from './pages/orders/order-list/order-list.component';
import { OrderDetailComponent } from './pages/orders/order-detail/order-detail.component';
import { UserListComponent } from './pages/users/user-list/user-list.component';
import { UserEditDialogComponent } from './pages/users/user-edit-dialog/user-edit-dialog.component';
import { MessageListComponent } from './pages/messages/message-list/message-list.component';
import { MessageDetailComponent } from './pages/messages/message-detail/message-detail.component';
import { SectionListComponent } from './pages/sections/section-list/section-list.component';
import { SectionFormComponent } from './pages/sections/section-form/section-form.component';
import { PaymentsComponent } from './pages/payments/payments.component';
import { PaymentDetailsDialogComponent } from './pages/payments/payment-details-dialog.component';
import { OrderDetailsDialogComponent } from './pages/payments/order-details-dialog.component';
// Shared Components
import { DataTableComponent } from './components/blocks/data-table/data-table.component';
import { ListContainerComponent } from './components/blocks/list-container/list-container.component';
import { AdminTableComponent } from './components/blocks/admin-table/admin-table.component';
import { FormFieldComponent } from './components/ui/form-field/form-field.component';
import { ActionButtonComponent } from './components/ui/action-button/action-button.component';
import { CategoryFormComponent } from './pages/categories/category-form/category-form.component';
import { ImageUploadComponent } from './components/ui/image-upload/image-upload.component';
import { ImageProcessorComponent } from './components/ui/image-processor/image-processor.component';
import { ErrorDialogComponent } from './components/error-dialog/error-dialog.component';
import { ConfirmationDialogComponent } from './components/confirmation-dialog/confirmation-dialog.component';
import { SearchBarComponent } from './components/ui/search-bar/search-bar.component';
import { StatCardComponent } from './components/ui/stat-card/stat-card.component';
import { SharedModule } from '../app/shared/shared.module';

// Services
import { NotificationService } from './services/notification.service';
import { DashboardService } from './services/dashboard.service';
import { MessageService } from './services/message.service';
import { SectionService } from './services/section.service';
import { ErrorHandlerService } from './services/error-handler.service';
import { ConfirmationService } from './services/confirmation.service';
import { PaymentService } from './services/payment.service';

// Interceptors

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
@NgModule({
  declarations: [
    AdminLayoutComponent,
    AdminLoginComponent,
    SidenavComponent,
    HeaderComponent,
    DashboardComponent,
    ProductListComponent,
    ProductFormComponent,
    CategoryListComponent,
    CategoryFormComponent,
    OrderListComponent,
    OrderDetailComponent,
    MessageListComponent,
    MessageDetailComponent,
    SectionListComponent,
    SectionFormComponent,
    PaymentsComponent,
    PaymentDetailsDialogComponent,
    OrderDetailsDialogComponent,

    UserListComponent,
    UserEditDialogComponent,
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
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    AdminRoutingModule,
    ListContainerComponent,
    // Angular Material Modules
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
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
    MatMenuModule,
    MatBadgeModule,
    MatChipsModule,
    MatDividerModule,
    MatTooltipModule,
    MatSlideToggleModule,
    MatButtonToggleModule,
    DragDropModule,
    LayoutModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    SharedModule,
  ],
  providers: [
    NotificationService,
    DashboardService,
    MessageService,
    SectionService,
    ErrorHandlerService,
    ConfirmationService,
    PaymentService
  ]
})
export class AdminModule { }
