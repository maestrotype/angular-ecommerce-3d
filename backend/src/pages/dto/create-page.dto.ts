import { IsIn, IsNotEmpty, IsObject, IsOptional, IsString, Matches } from 'class-validator';
import { PageStatus, PageTemplate } from '../entities/page.entity';

export class CreatePageDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug must be lowercase letters, numbers and hyphens',
  })
  slug: string;

  @IsObject()
  title: Record<string, string>;

  @IsOptional()
  @IsObject()
  content?: Record<string, string>;

  @IsOptional()
  @IsObject()
  seoDescription?: Record<string, string>;

  @IsOptional()
  @IsIn(['simple', 'sections', 'contact', 'landing-page', 'faq-page', 'collection-page', 'brand-page'])
  template?: PageTemplate;

  @IsOptional()
  @IsIn(['draft', 'published'])
  status?: PageStatus;
}
