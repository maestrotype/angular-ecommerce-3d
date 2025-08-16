import { IsOptional, IsEnum, IsDateString, IsString, IsNumber, Min, Max } from 'class-validator';
import { PaymentStatus, PaymentMethod } from '../entities/payment.entity';
import { Transform, Type } from 'class-transformer';

export class SearchPaymentsDto {
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @IsOptional()
  @Transform(({ value }) => value ? new Date(value) : undefined)
  startDate?: Date;

  @IsOptional()
  @Transform(({ value }) => value ? new Date(value) : undefined)
  endDate?: Date;

  @IsOptional()
  @IsString()
  customerEmail?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minAmount?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxAmount?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  offset?: number = 0;
} 