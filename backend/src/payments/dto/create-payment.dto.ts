import { IsEnum, IsNumber, IsOptional, IsString, IsEmail } from 'class-validator';
import { PaymentMethod, Currency } from '../entities/payment.entity';

export class CreatePaymentDto {
  @IsNumber()
  orderId: number;

  @IsNumber()
  amount: number;

  @IsEnum(Currency)
  currency: Currency;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEmail()
  customerEmail?: string;

  @IsOptional()
  @IsString()
  customerPhone?: string;

  @IsOptional()
  metadata?: any;
}

export class LiqPayWebhookDto {
  @IsString()
  data: string;
}

export interface PaymentResponseDto {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
} 