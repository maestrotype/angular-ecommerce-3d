
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { AuthModule } from './auth/auth.module';
import { OrdersModule } from './orders/orders.module';
import { DatabaseConfig } from './config/database.config';
import { NotificationsModule } from './notifications/notifications.module';
import { MessagesModule } from './messages/messages.module';
import { SectionsModule } from './sections/sections.module';
import { UploadsModule } from './uploads/uploads.module';
// import { ServeStaticModule } from '@nestjs/serve-static';
// import { join } from 'path';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConfig,
    }),
    CategoriesModule,
    ProductsModule,
    AuthModule,
    OrdersModule,
    MessagesModule,
    SectionsModule,
    NotificationsModule,
    UploadsModule
  ],
})
export class AppModule {}
