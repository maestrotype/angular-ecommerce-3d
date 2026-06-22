import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { v2 as cloudinary } from 'cloudinary';
import { Settings } from '../settings/entities/settings.entity';

export type CloudinaryConfigSource = 'database' | 'environment' | 'none';

export interface CloudinaryStatusDto {
  configured: boolean;
  source: CloudinaryConfigSource;
  cloudName: string | null;
  apiKeySet: boolean;
  apiSecretSet: boolean;
  connectionOk: boolean | null;
  connectionError: string | null;
  uploadReady: boolean;
  messageKey: string;
  messageParams?: Record<string, string>;
}

@Injectable()
export class CloudinaryConfigService implements OnModuleInit {
  private readonly logger = new Logger(CloudinaryConfigService.name);
  private source: CloudinaryConfigSource = 'none';
  private activeCloudName: string | null = null;
  private activeApiKey: string | null = null;
  private activeApiSecret: string | null = null;

  constructor(
    @InjectRepository(Settings)
    private readonly settingsRepository: Repository<Settings>,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.refresh();
  }

  async refresh(): Promise<void> {
    const dbCreds = await this.loadFromDatabase();
    if (dbCreds) {
      this.applyCredentials(dbCreds, 'database');
      this.logger.log(`Cloudinary configured from database (cloud: ${this.mask(dbCreds.cloudName)})`);
      return;
    }

    const envCreds = this.loadFromEnvironment();
    if (envCreds) {
      this.applyCredentials(envCreds, 'environment');
      this.logger.log(`Cloudinary configured from environment (cloud: ${this.mask(envCreds.cloudName)})`);
      return;
    }

    this.source = 'none';
    this.activeCloudName = null;
    this.activeApiKey = null;
    this.activeApiSecret = null;
    this.logger.warn('Cloudinary is NOT configured — 3D uploads will fail on production');
  }

  isConfigured(): boolean {
    return this.source !== 'none' && !!this.activeCloudName && !!this.activeApiKey && !!this.activeApiSecret;
  }

  getSource(): CloudinaryConfigSource {
    return this.source;
  }

  getMaskedCloudName(): string | null {
    return this.activeCloudName ? this.mask(this.activeCloudName) : null;
  }

  async getStatus(): Promise<CloudinaryStatusDto> {
    const configured = this.isConfigured();
    let connectionOk: boolean | null = null;
    let connectionError: string | null = null;

    if (configured) {
      try {
        const ping = await cloudinary.api.ping();
        connectionOk = ping?.status === 'ok';
        if (!connectionOk) {
          connectionError = 'Cloudinary ping returned unexpected response';
        }
      } catch (error: any) {
        connectionOk = false;
        connectionError = error?.message || 'Cloudinary connection failed';
      }
    }

    const uploadReady = configured && connectionOk === true;
    let messageKey = 'CLOUDINARY_STATUS_NOT_CONFIGURED';
    const messageParams: Record<string, string> = {};

    if (configured && connectionOk === true) {
      messageKey = this.source === 'database' ? 'CLOUDINARY_STATUS_READY_DB' : 'CLOUDINARY_STATUS_READY_ENV';
      messageParams.cloudName = this.mask(this.activeCloudName!);
    } else if (configured && connectionOk === false) {
      messageKey = 'CLOUDINARY_STATUS_CONNECTION_FAILED';
      messageParams.cloudName = this.mask(this.activeCloudName!);
      messageParams.error = connectionError || 'unknown';
    } else if (!configured) {
      const dbPartial = await this.hasPartialDatabaseCredentials();
      if (dbPartial) {
        messageKey = 'CLOUDINARY_STATUS_INCOMPLETE_DB';
      }
    }

    return {
      configured,
      source: this.source,
      cloudName: this.activeCloudName ? this.mask(this.activeCloudName) : null,
      apiKeySet: !!this.activeApiKey,
      apiSecretSet: !!this.activeApiSecret,
      connectionOk,
      connectionError,
      uploadReady,
      messageKey,
      messageParams,
    };
  }

  assertUploadReady(): void {
    if (!this.isConfigured()) {
      throw new Error('CLOUDINARY_NOT_CONFIGURED');
    }
  }

  private async loadFromDatabase(): Promise<{ cloudName: string; apiKey: string; apiSecret: string } | null> {
    const settings = await this.settingsRepository.find({
      where: { key: In(['cloudinary.cloudName', 'cloudinary.apiKey', 'cloudinary.apiSecret']) },
    });

    const map: Record<string, string> = {};
    settings.forEach((s) => {
      const key = s.key.split('.')[1];
      map[key] = s.value;
    });

    if (map.cloudName && map.apiKey && map.apiSecret && !this.isMasked(map.apiSecret)) {
      return { cloudName: map.cloudName, apiKey: map.apiKey, apiSecret: map.apiSecret };
    }
    return null;
  }

  private async hasPartialDatabaseCredentials(): Promise<boolean> {
    const settings = await this.settingsRepository.find({
      where: { key: In(['cloudinary.cloudName', 'cloudinary.apiKey', 'cloudinary.apiSecret']) },
    });
    return settings.some((s) => !!s.value);
  }

  private loadFromEnvironment(): { cloudName: string; apiKey: string; apiSecret: string } | null {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    if (cloudName && apiKey && apiSecret) {
      return { cloudName, apiKey, apiSecret };
    }
    return null;
  }

  private applyCredentials(
    creds: { cloudName: string; apiKey: string; apiSecret: string },
    source: CloudinaryConfigSource,
  ): void {
    cloudinary.config({
      cloud_name: creds.cloudName,
      api_key: creds.apiKey,
      api_secret: creds.apiSecret,
    });
    this.source = source;
    this.activeCloudName = creds.cloudName;
    this.activeApiKey = creds.apiKey;
    this.activeApiSecret = creds.apiSecret;
  }

  private mask(value: string): string {
    if (!value || value.length <= 4) return '****';
    return `${value.slice(0, 2)}****${value.slice(-2)}`;
  }

  private isMasked(value: string): boolean {
    return value.includes('****') || value === '********';
  }
}
