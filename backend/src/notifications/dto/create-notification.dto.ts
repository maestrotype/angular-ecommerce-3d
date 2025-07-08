import { IsEnum, IsOptional, IsString, IsNumber } from 'class-validator';
import { NotificationType } from '../entities/notification.entity';

export class CreateNotificationDto {
  @IsEnum(NotificationType)
  type: NotificationType;

  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsOptional()
  data?: any;

  @IsOptional()
  @IsNumber()
  userId?: number;
}