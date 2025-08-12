import { IsNotEmpty, IsNumber, IsString, IsEnum, IsOptional, IsEmail, Min, MaxLength } from 'class-validator';
import { PaymentMethod, Currency } from '../entities/payment.entity';

export class CreatePaymentDto {
  @IsNotEmpty()
  @IsNumber()
  orderId: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsNotEmpty()
  @IsEnum(Currency)
  currency: Currency;

  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsEmail()
  customerEmail?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  customerPhone?: string;

  @IsOptional()
  @IsString()
  metadata?: string;
}

export class LiqPayWebhookDto {
  @IsNotEmpty()
  @IsString()
  data: string;

  @IsNotEmpty()
  @IsString()
  signature: string;
}

export class PaymentResponseDto {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
} 