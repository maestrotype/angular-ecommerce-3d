
import { IsEnum, IsNotEmpty, IsString, IsOptional, IsBoolean, IsNumber, IsObject } from 'class-validator';

export class CreateSectionDto {
  @IsString()
  type: string;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  subtitle?: string;

  @IsOptional()
  @IsString()
  content?: string;

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
}
