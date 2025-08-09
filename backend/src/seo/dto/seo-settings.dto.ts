import { IsString, IsOptional, IsUrl, IsBoolean, MaxLength, ValidateIf } from 'class-validator';

export class UpdateSeoSettingsDto {
  @IsString()
  @MaxLength(60)
  siteName: string;

  @IsString()
  @MaxLength(160)
  siteDescription: string;

  @IsString()
  @MaxLength(500)
  siteKeywords: string;

  @IsUrl()
  siteUrl: string;

  @IsString()
  @MaxLength(10)
  defaultLanguage: string;

  @IsOptional()
  @IsString()
  defaultOgImage?: string;

  @IsOptional()
  @ValidateIf((o) => o.ogSiteName && o.ogSiteName.trim() !== '')
  @IsString()
  @MaxLength(60)
  ogSiteName?: string;

  @IsOptional()
  @ValidateIf((o) => o.twitterHandle && o.twitterHandle.trim() !== '')
  @IsString()
  @MaxLength(15)
  twitterHandle?: string;

  @IsOptional()
  @IsString()
  googleAnalyticsId?: string;

  @IsOptional()
  @IsString()
  googleSearchConsole?: string;

  @IsOptional()
  @IsString()
  bingWebmasterTools?: string;

  @IsOptional()
  @IsString()
  robotsTxtContent?: string;

  @IsBoolean()
  enableSitemap: boolean;

  @IsBoolean()
  enableStructuredData: boolean;
}

export class SeoSettingsResponseDto {
  id: number;
  siteName: string;
  siteDescription: string;
  siteKeywords: string;
  siteUrl: string;
  defaultLanguage: string;
  defaultOgImage?: string;
  ogSiteName?: string;
  twitterHandle?: string;
  googleAnalyticsId?: string;
  googleSearchConsole?: string;
  bingWebmasterTools?: string;
  robotsTxtContent?: string;
  enableSitemap: boolean;
  enableStructuredData: boolean;
  createdAt: Date;
  updatedAt: Date;
} 