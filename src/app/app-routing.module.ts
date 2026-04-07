import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AboutComponent } from './pages/about/about.component';
import { FavoritesComponent } from './pages/favorites/favorites.component';
import { MyOrdersComponent } from './pages/my-orders/my-orders.component';
import { ContactsComponent } from './pages/contacts/contacts.component';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';
import { PaymentComponent } from './pages/payment/payment.component';
import { PaymentSuccessComponent } from './pages/payment-success/payment-success.component';
import { PaymentErrorComponent } from './pages/payment-error/payment-error.component';


const routes: Routes = [
  { path: '', loadChildren: () => import('./pages/home/home.module').then(m => m.HomeModule) },
  { path: 'home', loadChildren: () => import('./pages/home/home.module').then(m => m.HomeModule) },
  { path: 'shop', loadChildren: () => import('./pages/shop/shop.module').then(m => m.ShopModule) },
  { path: 'about', loadComponent: () => import('./pages/about/about.component').then(m => m.AboutComponent) },
  { path: 'favorites', component: FavoritesComponent },
  { path: 'my-orders', component: MyOrdersComponent },
  { path: 'contacts', loadComponent: () => import('./pages/contacts/contacts.component').then(m => m.ContactsComponent) },
  { path: 'product/:id', loadChildren: () => import('./components/product-detail/product-detail.module').then(m => m.ProductDetailModule) },
  { path: 'checkout', component: CheckoutComponent },
  { path: 'payment/:id', component: PaymentComponent },
  { path: 'payment/success', component: PaymentSuccessComponent },
  { path: 'payment/error', component: PaymentErrorComponent },
  { path: 'viewer', loadComponent: () => import('./components/product-viewer/product-viewer.component').then(m => m.ProductViewerComponent) },

  {
    path: 'admin',
    loadChildren: () => import('../admin/admin.module').then(m => m.AdminModule)
  },
  { path: '**', redirectTo: '/home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    onSameUrlNavigation: 'reload',
    scrollPositionRestoration: 'top', // Automatically scroll to top on route change
    initialNavigation: 'enabledBlocking'
  })],
  exports: [RouterModule],
})
export class AppRoutingModule { }
