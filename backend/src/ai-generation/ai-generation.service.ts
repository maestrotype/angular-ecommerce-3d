import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { SettingsService } from '../settings/settings.service';
import { firstValueFrom } from 'rxjs';
import axios from 'axios';
import cloudinary from '../config/cloudinary.config';
import * as fs from 'fs';
import * as path from 'path';
import { GlbOptimizationService, CLOUDINARY_RAW_FILE_LIMIT } from '../services/glb-optimization.service';
import { getProduct3dDir, getServerBaseUrl, resolveLocalUploadPath } from '../services/model-storage.util';

import { AiGenerationProvider, AiTaskResult } from './interfaces/ai-provider.interface';
import { Tripo3dProvider } from './providers/tripo3d.provider';
import { Hunyuan3dProvider } from './providers/hunyuan3d.provider';
import { MeshyProvider } from './providers/meshy.provider';
import { LumaAiProvider } from './providers/luma.provider';
import { CustomProvider } from './providers/custom.provider';
import { Unique3dProvider } from './providers/unique3d.provider';
import { HunyuanV2Provider } from './providers/hunyuan-v2.provider';
import { HuggingFaceProvider } from './providers/huggingface.provider';
import {
  AI_PROVIDER_CATALOG,
  decodeProviderTaskId,
  encodeProviderTaskId,
  getProviderMeta,
  normalizeProviderId,
} from './provider-catalog';

@Injectable()
export class AiGenerationService {
  private readonly logger = new Logger(AiGenerationService.name);

  constructor(
    private settingsService: SettingsService,
    private glbOptimizationService: GlbOptimizationService,
    private tripo3dProvider: Tripo3dProvider,
    private hunyuan3dProvider: Hunyuan3dProvider,
    private meshyProvider: MeshyProvider,
    private lumaAiProvider: LumaAiProvider,
    private customProvider: CustomProvider,
    private unique3dProvider: Unique3dProvider,
    private hunyuanV2Provider: HunyuanV2Provider,
    private huggingFaceProvider: HuggingFaceProvider,
  ) {}

  private async readActiveProviderId(): Promise<string> {
    const activeSetting = await firstValueFrom(
      this.settingsService.getSettingByKey('ai.activeProvider'),
    ).catch(() => null);
    return normalizeProviderId(activeSetting?.value || 'tripo3d');
  }

  private resolveProvider(providerId: string): AiGenerationProvider {
    switch (normalizeProviderId(providerId)) {
      case 'hunyuan3d':
        return this.hunyuan3dProvider;
      case 'meshy':
        return this.meshyProvider;
      case 'luma':
        return this.lumaAiProvider;
      case 'custom':
        return this.customProvider;
      case 'unique3d':
        return this.unique3dProvider;
      case 'hunyuan_v2':
        return this.hunyuanV2Provider;
      case 'huggingface':
        return this.huggingFaceProvider;
      case 'tripo3d':
      default:
        return this.tripo3dProvider;
    }
  }

  private async getActiveProvider(): Promise<AiGenerationProvider> {
    try {
      return this.resolveProvider(await this.readActiveProviderId());
    } catch (error) {
      this.logger.error(`Error resolving active provider: ${error.message}, falling back to tripo3d`);
      return this.tripo3dProvider;
    }
  }

  private async isConfigured(configKey: string, providerId: string): Promise<boolean> {
    const setting = await firstValueFrom(this.settingsService.getSettingByKey(configKey)).catch(() => null);
    if (setting?.value?.trim()) {
      return true;
    }
    if (providerId === 'tripo3d') {
      return !!process.env.TRIPO_API_KEY?.trim();
    }
    if (providerId === 'huggingface') {
      return true;
    }
    return false;
  }

  async listProviders() {
    const activeProvider = await this.readActiveProviderId();
    const providers = [];

    for (const meta of AI_PROVIDER_CATALOG) {
      providers.push({
        id: meta.id,
        name: meta.name,
        implemented: meta.implemented,
        configured: await this.isConfigured(meta.configKey, meta.id),
        active: meta.id === activeProvider,
      });
    }

    return { activeProvider, providers };
  }

  async setActiveProvider(providerId: string) {
    const canonical = normalizeProviderId(providerId);
    const meta = getProviderMeta(canonical);
    if (!meta) {
      throw new HttpException(`Unknown AI provider: ${providerId}`, HttpStatus.BAD_REQUEST);
    }

    await firstValueFrom(
      this.settingsService.updateSetting({
        key: 'ai.activeProvider',
        value: canonical,
        type: 'string',
        category: 'ai',
        description: 'Active AI Provider',
      }),
    );

    return this.listProviders();
  }

  private async alternatives(failedProviderId: string) {
    const catalog = await this.listProviders();
    return catalog.providers.filter(
      (item) => item.id !== failedProviderId && item.implemented && item.configured,
    );
  }

  async generateTask(imageUrl: string, isHq: boolean = false, providerId?: string) {
    const requestedId = providerId ? normalizeProviderId(providerId) : await this.readActiveProviderId();
    const provider = this.resolveProvider(requestedId);

    if (provider.providerId === 'custom') {
      const hqSetting = await firstValueFrom(this.settingsService.getSettingByKey('ai.customUseHq')).catch(() => null);
      if (hqSetting) {
        isHq = hqSetting.value === 'true';
      }
    }

    this.logger.log(`Delegating generateTask to ${provider.providerId} (HQ: ${isHq})`);

    try {
      const result = await provider.generateTask(imageUrl, isHq);
      return {
        code: 0,
        data: {
          task_id: encodeProviderTaskId(provider.providerId, result.taskId),
          provider: provider.providerId,
        },
        message: 'success',
      };
    } catch (error) {
      this.logger.error(`Generation failed for ${provider.providerId}: ${error.message}`);
      return {
        code: 1,
        message: error.message || 'AI generation service unreachable',
        provider: provider.providerId,
        alternatives: await this.alternatives(provider.providerId),
      };
    }
  }

  async getTaskStatus(taskId: string) {
    const decoded = decodeProviderTaskId(taskId);
    const provider = decoded.providerId
      ? this.resolveProvider(decoded.providerId)
      : await this.getActiveProvider();
    const result = await provider.getTaskStatus(decoded.remoteTaskId);

    return {
      code: 0,
      data: {
        task_id: encodeProviderTaskId(provider.providerId, result.taskId || decoded.remoteTaskId),
        status: result.status,
        progress: result.progress,
        error: result.error,
        localPath: result.localPath,
        provider: provider.providerId,
        result: {
          model: result.modelUrl || null,
        },
      },
      message: result.error || 'success',
    };
  }

  async listTasks() {
    const provider = await this.getActiveProvider();
    return provider.listTasks();
  }

  /**
   * Downloads a model from any provider URL, optimizes it, and uploads to Cloudinary while saving HQ locally.
   */
  async downloadModel(url: string, filename: string) {
    const safeName = (filename || 'model.glb').replace(/[^a-zA-Z0-9._-]/g, '-');
    try {
      this.logger.log(`Downloading model from ${url} for optimization and storage...`);
      const buffer = await this.readModelBuffer(url);

      // 1. Save HQ file locally
      const uploadsDir = getProduct3dDir();

      const hqFilename = safeName.replace('.glb', '_hq.glb');
      const hqFilePath = path.join(uploadsDir, hqFilename);
      fs.writeFileSync(hqFilePath, buffer);
      this.logger.log(`Saved high-quality model locally at ${hqFilePath}`);

      // 2. Optimize the file using gltf-transform
      const optFilename = safeName.replace('.glb', '_opt.glb');
      const optFilePath = path.join(uploadsDir, optFilename);

      this.logger.log(`Optimizing model using gltf-transform...`);
      const optimizedPath = await this.glbOptimizationService.optimize(hqFilePath);
      const uploadPath = optimizedPath || hqFilePath;
      if (optimizedPath && optimizedPath !== optFilePath) {
        fs.copyFileSync(optimizedPath, optFilePath);
      } else if (!optimizedPath) {
        fs.copyFileSync(hqFilePath, optFilePath);
      }

      const uploadSize = fs.statSync(uploadPath).size;
      this.logger.log(`Optimized model size: ${(uploadSize / 1024 / 1024).toFixed(2)}MB`);

      if (uploadSize > CLOUDINARY_RAW_FILE_LIMIT) {
        const serverUrl = getServerBaseUrl();
        if (fs.existsSync(optFilePath) && optFilePath !== hqFilePath) {
          fs.unlinkSync(optFilePath);
        }
        return {
          success: true,
          path: `${serverUrl}/uploads/products-3d/${hqFilename}`,
          localPath: `/uploads/products-3d/${hqFilename}`,
          publicId: `LOCAL:${hqFilePath}`,
        };
      }

      // 3. Upload optimized model to Cloudinary (<= 10MB)
      const optBuffer = fs.readFileSync(uploadPath);
      this.logger.log(`Uploading optimized model to Cloudinary (${optBuffer.length} bytes)...`);

      const uploadPromise = new Promise<any>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'product-3d-models',
            resource_type: 'raw',
            public_id: safeName.replace('.glb', ''),
            chunk_size: 6000000,
            timeout: 600000,
          },
          (error, result) => {
            if (error) {
              this.logger.error(`Cloudinary upload failed: ${error.message}`);
              reject(error);
            } else {
              resolve(result);
            }
          }
        );
        uploadStream.end(optBuffer);
      });

      try {
        const result = await uploadPromise;
        this.logger.log(`Model successfully archived at ${result.secure_url}`);

        if (fs.existsSync(optFilePath)) {
          fs.unlinkSync(optFilePath);
        }

        return {
          success: true,
          path: result.secure_url,
          localPath: `/uploads/products-3d/${hqFilename}`,
          publicId: result.public_id
        };
      } catch (cloudError) {
        this.logger.warn(`Cloudinary archive skipped: ${cloudError.message}. Serving local GLB.`);
        const serverUrl = getServerBaseUrl();
        return {
          success: true,
          path: `${serverUrl}/uploads/products-3d/${hqFilename}`,
          localPath: `/uploads/products-3d/${hqFilename}`,
          publicId: `LOCAL:${hqFilePath}`,
        };
      }
    } catch (error) {
      this.logger.error(`Persistent upload failed: ${error.message}`);
      throw new HttpException(`Persistent upload failed: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private async readModelBuffer(url: string): Promise<Buffer> {
    const localPath = resolveLocalUploadPath(url);
    if (localPath && fs.existsSync(localPath)) {
      this.logger.log(`Reading model from local disk ${localPath}`);
      return fs.readFileSync(localPath);
    }

    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 120000,
      maxRedirects: 5,
      validateStatus: (status) => status >= 200 && status < 400,
    });
    return Buffer.from(response.data);
  }
}
