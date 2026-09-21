import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class AiCopySpecDto {
  @IsOptional()
  @IsString()
  key?: string;

  @IsOptional()
  @IsString()
  value?: string;
}

export class DescribeProductCopyDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageUrls?: string[];

  @IsOptional()
  @IsString()
  name_en?: string;

  @IsOptional()
  @IsString()
  name_ru?: string;

  @IsOptional()
  @IsString()
  name_ua?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  categoryLabel?: string;

  @IsOptional()
  @IsString()
  description_en?: string;

  @IsOptional()
  @IsString()
  description_ru?: string;

  @IsOptional()
  @IsString()
  description_ua?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AiCopySpecDto)
  specifications?: AiCopySpecDto[];
}
