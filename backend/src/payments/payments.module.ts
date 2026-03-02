import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { LiqPayStrategy } from './strategies/liqpay.strategy';
import { Payment } from './entities/payment.entity';
import { OrdersModule } from '../orders/orders.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { EmailModule } from '../email/email.module';
import { EmailService } from '../email/email.service';
import { StripeStrategy } from './strategies/stripe.strategy';
import { PayPalStrategy } from './strategies/paypal.strategy';
import { AuthModule } from '../auth/auth.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([Payment]),
    ConfigModule,
    OrdersModule,
    NotificationsModule,
    EmailModule,
    AuthModule,
  ],
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    LiqPayStrategy,
    StripeStrategy,
    PayPalStrategy,
    EmailService,
  ],
  exports: [PaymentsService, LiqPayStrategy, StripeStrategy, PayPalStrategy],
})
export class PaymentsModule { } 