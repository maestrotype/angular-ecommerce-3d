
import {
  IsString,
  IsNumber,
  IsOptional,
  IsObject,
  IsArray,
  IsBoolean,
  Min,
  MaxLength,
  IsUrl,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateProductDto {
  @IsObject()
  name: any;

  @IsString()
  @MaxLength(100)
  category: string;

  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  price: number;

  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseInt(value))
  stock: number;

  @IsObject()
  description: any;

  @IsOptional()
  @IsString()
  @IsUrl()
  imageUrl?: string;

  @IsOptional()
  imageData?: Buffer;

  @IsOptional()
  @IsObject()
  specifications?: Record<string, string>;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  discount?: number;

  @IsOptional()
  @IsBoolean()
  isSpecial?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  rating?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsString()
  model3dUrl?: string;

  @IsOptional()
  @IsString()
  localModel3dUrl?: string;

  @IsOptional()
  @IsString()
  model3dPublicId?: string;

  @IsOptional()
  @IsString()
  hdModelPath?: string;
}
