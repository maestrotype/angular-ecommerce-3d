import { NgModule } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { BaseChartDirective } from 'ng2-charts';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminSharedModule } from './admin-shared.module';
import { AdminLayoutComponent } from './components/layout/admin-layout/admin-layout.component';
import { AdminLoginComponent } from './pages/login/admin-login.component';
import { SidenavComponent } from './components/layout/sidenav/sidenav.component';
import { HeaderComponent } from './components/layout/header/header.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { CategoryListComponent } from './pages/categories/category-list/category-list.component';
import { CategoryFormComponent } from './pages/categories/category-form/category-form.component';
import { UserListComponent } from './pages/users/user-list/user-list.component';
import { UserEditDialogComponent } from './pages/users/user-edit-dialog/user-edit-dialog.component';
import { MessageListComponent } from './pages/messages/message-list/message-list.component';
import { MessageDetailComponent } from './pages/messages/message-detail/message-detail.component';
import { PageListComponent } from './pages/pages/page-list/page-list.component';
import { PageFormComponent } from './pages/pages/page-form/page-form.component';
import { PaymentsComponent } from './pages/payments/payments.component';
import { PaymentDetailsDialogComponent } from './pages/payments/payment-details-dialog.component';
import { OrderDetailsDialogComponent } from './pages/payments/order-details-dialog.component';
import { IntegrationsComponent } from './pages/integrations/integrations.component';
import { PaginatorIntlService } from './services/paginator-intl.service';


@NgModule({
  declarations: [
    AdminLayoutComponent,
    AdminLoginComponent,
    SidenavComponent,
    HeaderComponent,
    DashboardComponent,
    CategoryListComponent,
    CategoryFormComponent,
    UserListComponent,
    UserEditDialogComponent,
    MessageListComponent,
    MessageDetailComponent,
    PageListComponent,
    PageFormComponent,
    PaymentsComponent,
    PaymentDetailsDialogComponent,
    OrderDetailsDialogComponent,
    IntegrationsComponent,
  ],
  imports: [
    AdminSharedModule,
    AdminRoutingModule,
    BaseChartDirective,
  ],
  providers: [
    { provide: MatPaginatorIntl, useClass: PaginatorIntlService },
  ],
})
export class AdminModule {}
