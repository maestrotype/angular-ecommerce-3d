import 'dotenv/config';
import { DataSource } from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { User } from '../../auth/entities/user.entity';
import { Order } from '../../orders/entities/order.entity';
import { Category } from '../../categories/entities/category.entity';
import { Notification } from '../../notifications/entities/notification.entity';
import { Section } from '../../sections/entities/section.entity';
import { Message } from '../../messages/entities/message.entity';
import { ProductRecommendation } from '../../recommendations/entities/product-recommendation.entity';
import { Payment } from '../../payments/entities/payment.entity';
import { Settings } from '../../settings/entities/settings.entity';
import { Page } from '../../pages/entities/page.entity';
import { seedProducts } from './product-seed';

const entities = [
  Section,
  Message,
  Notification,
  Category,
  Product,
  Order,
  User,
  ProductRecommendation,
  Payment,
  Settings,
  Page,
];

async function run() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    username: process.env.DATABASE_USERNAME || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    database: process.env.DATABASE_NAME || 'ecommerce_db',
    entities,
    synchronize: false,
  });

  await dataSource.initialize();
  try {
    await seedProducts(dataSource);
  } finally {
    await dataSource.destroy();
  }
}

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
