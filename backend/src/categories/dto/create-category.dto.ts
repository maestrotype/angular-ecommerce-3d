import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { Localizable } from '../../common/interfaces/localization.interface';

export class CreateCategoryDto {
  @IsOptional()
  name: Localizable;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  description?: Localizable;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}