import { IsEnum, IsOptional, IsString, IsNumber } from 'class-validator';
import { PaymentStatus } from '../entities/payment.entity';

export class UpdatePaymentStatusDto {
  @IsEnum(PaymentStatus)
  status: PaymentStatus;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsNumber()
  adminId?: number;
} 