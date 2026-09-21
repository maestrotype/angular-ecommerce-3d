import { NgModule } from '@angular/core';
import { AdminSharedModule } from '../../admin-shared.module';
import { OrdersRoutingModule } from './orders-routing.module';
import { OrderListComponent } from './order-list/order-list.component';
import { OrderDetailComponent } from './order-detail/order-detail.component';

@NgModule({
  declarations: [
    OrderListComponent,
    OrderDetailComponent,
  ],
  imports: [
    AdminSharedModule,
    OrdersRoutingModule,
  ],
})
export class OrdersModule {}
