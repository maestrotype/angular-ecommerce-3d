
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
import { UploadsModule } from './upload-module/uploads.module';
import { SeoModule } from './seo/seo.module';
import { PaymentsModule } from './payments/payments.module';
import { RecommendationsModule } from './recommendations/recommendations.module';
import { SettingsModule } from './settings/settings.module';
import { HealthController } from './health/health.controller';
// import { ServeStaticModule } from '@nestjs/serve-static';
// import { join } from 'path';
@Module({
  controllers: [HealthController],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      cache: false,
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
    UploadsModule,
    SeoModule,
    PaymentsModule,
    RecommendationsModule,
    SettingsModule
  ],
})
export class AppModule {}
