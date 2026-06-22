
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLayoutComponent } from './components/layout/admin-layout/admin-layout.component';
import { AdminLoginComponent } from './pages/login/admin-login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ProductListComponent } from './pages/products/product-list/product-list.component';
import { ProductFormComponent } from './pages/products/product-form/product-form.component';
import { CategoryListComponent } from './pages/categories/category-list/category-list.component';
import { OrderListComponent } from './pages/orders/order-list/order-list.component';
import { UserListComponent } from './pages/users/user-list/user-list.component';
import { AdminAuthGuard } from './guards/admin-auth.guard';
import { CategoryFormComponent } from './pages/categories/category-form/category-form.component';
import { MessageListComponent } from './pages/messages/message-list/message-list.component';
import { SectionListComponent } from './pages/sections/section-list/section-list.component';
import { PageListComponent } from './pages/pages/page-list/page-list.component';
import { PageFormComponent } from './pages/pages/page-form/page-form.component';
import { PaymentsComponent } from './pages/payments/payments.component';
import { IntegrationsComponent } from './pages/integrations/integrations.component';


const routes: Routes = [
  {
    path: 'login',
    component: AdminLoginComponent
  },
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [AdminAuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'products', component: ProductListComponent },
      { path: 'products/new', component: ProductFormComponent },
      { path: 'products/edit/:id', component: ProductFormComponent },
      { path: 'categories', component: CategoryListComponent },
      {
        path: 'categories/new',
        component: CategoryFormComponent,
      },
      {
        path: 'categories/edit/:id',
        component: CategoryFormComponent,
      },
      { path: 'orders', component: OrderListComponent },
      { path: 'users', component: UserListComponent },
      { path: 'messages', component: MessageListComponent },
      { path: 'sections', component: SectionListComponent },
      { path: 'pages', component: PageListComponent },
      { path: 'pages/new', component: PageFormComponent },
      { path: 'pages/edit/:id', component: PageFormComponent },
      { path: 'payments', component: PaymentsComponent },
      { path: 'integrations', component: IntegrationsComponent },

      { 
        path: 'seo', 
        loadChildren: () => import('./pages/seo/seo.module').then(m => m.SeoModule)
      },
      { 
        path: 'profile', 
        loadChildren: () => import('./pages/profile/profile.module').then(m => m.ProfileModule)
      },
      { 
        path: 'settings', 
        loadChildren: () => import('./pages/settings/settings.module').then(m => m.SettingsModule)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
