import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { HomeComponent } from "./pages/home/home.component";
import { ShopComponent } from "./pages/shop/shop.component";
import { AboutComponent } from "./pages/about/about.component";
// import { ContactComponent } from './pages/contact/contact.component';
import { ProductDetailComponent } from "./components/product-detail/product-detail.component";

const routes: Routes = [
  { path: "home", component: HomeComponent },
  { path: "shop", component: ShopComponent },
  { path: "about", component: AboutComponent },
  // { path: 'contact', component: ContactComponent },
  { path: "product/:id", component: ProductDetailComponent },
  { path: "", redirectTo: "/home", pathMatch: "full" },

  {
    path: 'admin',
    loadChildren: () => import('../admin/admin.module').then(m => m.AdminModule)
  },
  // Admin (lazy-load)
  // {
  //   path: "admin",
  //   loadChildren: () =>
  //     import("../admin/admin.module").then((m) => m.AdminModule),
  // },
  {
    path: '',
    redirectTo: '/',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/'
  }
  // { path: "", redirectTo: "/home", pathMatch: "full" },
  // { path: "**", redirectTo: "/home" }, // fallback
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
