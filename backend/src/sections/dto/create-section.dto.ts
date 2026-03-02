
import { IsEnum, IsNotEmpty, IsString, IsOptional, IsBoolean, IsNumber, IsObject } from 'class-validator';
import { Localizable } from '../../common/interfaces/localization.interface';

export class CreateSectionDto {
  @IsString()
  type: string;

  @IsOptional()
  title?: Localizable;

  @IsOptional()
  subtitle?: Localizable;

  @IsOptional()
  content?: Localizable;

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
