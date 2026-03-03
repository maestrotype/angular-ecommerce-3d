import { IsString, IsOptional, IsBoolean, IsObject } from 'class-validator';

export class CreateCategoryDto {
  @IsObject()
  name: any;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsObject()
  description?: any;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}