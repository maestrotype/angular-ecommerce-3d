import { IsString, IsOptional, IsBoolean, IsNumber, IsObject } from 'class-validator';

export class UpdateSettingsDto {
  @IsString()
  key: string;

  @IsString()
  value: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdatePaymentSettingsDto {
  @IsOptional()
  @IsBoolean()
  stripeEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  stripeTestMode?: boolean;

  @IsOptional()
  @IsString()
  stripePublishableKey?: string;

  @IsOptional()
  @IsString()
  stripeSecretKey?: string;

  @IsOptional()
  @IsString()
  stripeWebhookSecret?: string;

  @IsOptional()
  @IsBoolean()
  liqpayEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  liqpayTestMode?: boolean;

  @IsOptional()
  @IsString()
  liqpayPublicKey?: string;

  @IsOptional()
  @IsString()
  liqpayPrivateKey?: string;

  @IsOptional()
  @IsBoolean()
  paypalEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  paypalTestMode?: boolean;

  @IsOptional()
  @IsString()
  paypalClientId?: string;

  @IsOptional()
  @IsString()
  paypalClientSecret?: string;

  @IsOptional()
  @IsString()
  defaultPaymentMethod?: string;
}

export class UpdateGeneralSettingsDto {
  @IsOptional()
  @IsString()
  siteName?: string;

  @IsOptional()
  @IsString()
  siteDescription?: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsString()
  language?: string;
}

export class UpdateSecuritySettingsDto {
  @IsOptional()
  @IsBoolean()
  twoFactorAuth?: boolean;

  @IsOptional()
  @IsNumber()
  sessionTimeout?: number;

  @IsOptional()
  @IsNumber()
  passwordExpiry?: number;

  @IsOptional()
  @IsNumber()
  maxLoginAttempts?: number;
}

export class UpdateNotificationSettingsDto {
  @IsOptional()
  @IsBoolean()
  emailNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  orderNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  stockAlerts?: boolean;

  @IsOptional()
  @IsBoolean()
  userRegistrations?: boolean;

  @IsOptional()
  @IsBoolean()
  systemUpdates?: boolean;
}

export class UpdateCloudinarySettingsDto {
  @IsOptional()
  @IsString()
  cloudName?: string;

  @IsOptional()
  @IsString()
  apiKey?: string;

  @IsOptional()
  @IsString()
  apiSecret?: string;
}

export class UpdateAiSettingsDto {
  @IsOptional()
  @IsString()
  activeProvider?: string;

  @IsOptional()
  @IsString()
  tripoApiKey?: string;

  @IsOptional()
  @IsString()
  meshyApiKey?: string;

  @IsOptional()
  @IsString()
  hunyuanApiKey?: string;

  @IsOptional()
  @IsString()
  lumaApiKey?: string;

  @IsOptional()
  @IsString()
  customUrl?: string;

  @IsOptional()
  @IsBoolean()
  customUseHq?: boolean;
}

export class UpdateSMTPSettingsDto {
  @IsOptional()
  @IsString()
  host?: string;

  @IsOptional()
  @IsNumber()
  port?: number;

  @IsOptional()
  @IsString()
  user?: string;

  @IsOptional()
  @IsString()
  pass?: string;

  @IsOptional()
  @IsString()
  fromEmail?: string;
}

