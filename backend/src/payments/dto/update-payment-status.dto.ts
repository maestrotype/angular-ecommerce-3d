import { IsEnum, IsOptional, IsString, IsNumber, IsIn } from 'class-validator';
import { PaymentStatus } from '../entities/payment.entity';

export class UpdatePaymentStatusDto {
  @IsIn(['pending', 'processing', 'completed', 'failed'])
  status: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsNumber()
  adminId?: number;
} 