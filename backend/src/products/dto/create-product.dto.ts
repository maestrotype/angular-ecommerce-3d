
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
    @IsString()
    @MaxLength(255)
    name: string;
  
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
  
    @IsString()
    description: string;
  
    @IsOptional()
    @IsString()
    @IsUrl()
    imageUrl?: string;
  
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
  }
  