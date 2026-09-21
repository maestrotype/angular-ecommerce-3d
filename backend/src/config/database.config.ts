
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmOptionsFactory, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Product } from '../products/entities/product.entity';
import { User } from '../auth/entities/user.entity';
import { Order } from '../orders/entities/order.entity';
import { Category } from '../categories/entities/category.entity';
import { Notification } from '../notifications/entities/notification.entity';
import { Section } from '../sections/entities/section.entity';
import { Message } from '../messages/entities/message.entity';
import { ProductRecommendation } from '../recommendations/entities/product-recommendation.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Settings } from '../settings/entities/settings.entity';
import { Page } from '../pages/entities/page.entity';
import { NewsletterSubscriber } from '../newsletter/entities/newsletter-subscriber.entity';

@Injectable()
export class DatabaseConfig implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const host = this.configService.get<string>('DATABASE_HOST') ?? '';
    const nodeEnv = this.configService.get<string>('NODE_ENV');
    const isPooledRemote = /pooler\.supabase\.com|\.neon\.tech|\.pooler\./i.test(host);
    const sslExplicit = this.configService.get<string>('DATABASE_SSL');
    const useSsl =
      sslExplicit === 'true' ||
      (sslExplicit !== 'false' && (nodeEnv === 'production' || isPooledRemote));

    const configuredPoolMax = parseInt(this.configService.get('DATABASE_POOL_MAX') ?? '', 10);
    const defaultPoolMax = isPooledRemote ? 4 : 10;
    const poolMax =
      Number.isFinite(configuredPoolMax) && configuredPoolMax > 0
        ? configuredPoolMax
        : defaultPoolMax;
    const cappedPoolMax = isPooledRemote ? Math.min(poolMax, 10) : poolMax;

    const syncExplicit = this.configService.get<string>('TYPEORM_SYNCHRONIZE');
    const synchronize =
      syncExplicit === 'true' ||
      (syncExplicit !== 'false' && nodeEnv !== 'production');

    return {
      type: 'postgres',
      host: this.configService.get('DATABASE_HOST'),
      port: this.configService.get('DATABASE_PORT'),
      username: this.configService.get('DATABASE_USERNAME'),
      password: this.configService.get('DATABASE_PASSWORD'),
      database: this.configService.get('DATABASE_NAME'),
      entities: [Section, Message, Notification, Category, Product, Order, User, ProductRecommendation, Payment, Settings, Page, NewsletterSubscriber],
      synchronize,
      logging: nodeEnv === 'development',
      ssl: useSsl ? { rejectUnauthorized: false } : false,
      extra: {
        max: cappedPoolMax,
        min: 0,
        idleTimeoutMillis: 10_000,
        connectionTimeoutMillis: 5_000,
        allowExitOnIdle: true,
      },
    };
  }
}
