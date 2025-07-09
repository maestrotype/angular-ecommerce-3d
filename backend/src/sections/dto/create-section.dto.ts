
import { IsEnum, IsNotEmpty, IsString, IsOptional, IsBoolean, IsNumber, IsObject } from 'class-validator';

export class CreateSectionDto {
  @IsEnum(['hero', 'about', 'contact', 'promo', 'features', 'testimonials'])
  type: 'hero' | 'about' | 'contact' | 'promo' | 'features' | 'testimonials';

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

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
