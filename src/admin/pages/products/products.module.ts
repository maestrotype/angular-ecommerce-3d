import { NgModule } from '@angular/core';
import { AdminSharedModule } from '../../admin-shared.module';
import { ProductsRoutingModule } from './products-routing.module';
import { ProductListComponent } from './product-list/product-list.component';
import { ProductFormComponent } from './product-form/product-form.component';
import { ProductAiCopyDialogComponent } from './product-form/product-ai-copy-dialog.component';

@NgModule({
  declarations: [
    ProductListComponent,
    ProductFormComponent,
    ProductAiCopyDialogComponent,
  ],
  imports: [
    AdminSharedModule,
    ProductsRoutingModule,
  ],
})
export class ProductsModule {}
