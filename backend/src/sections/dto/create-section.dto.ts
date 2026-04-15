
import { IsEnum, IsNotEmpty, IsString, IsOptional, IsBoolean, IsNumber, IsObject } from 'class-validator';

export class CreateSectionDto {
  @IsString()
  type: string;

  @IsNotEmpty()
  @IsObject()
  title: any;

  @IsOptional()
  @IsObject()
  subtitle?: any;

  @IsOptional()
  @IsObject()
  content?: any;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  model3dUrl?: string;

  @IsOptional()
  @IsBoolean()
  show3d?: boolean;

  @IsOptional()
  @IsBoolean()
  showImage?: boolean;

  @IsOptional()
  @IsNumber()
  order?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;

  @IsOptional()
  @IsString()
  pageTarget?: string;

  @IsOptional()
  @IsString()
  variant?: string;

  @IsOptional()
  @IsString()
  anchorId?: string;
}
