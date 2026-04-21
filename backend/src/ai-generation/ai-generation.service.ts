import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { SettingsService } from '../settings/settings.service';
import { firstValueFrom } from 'rxjs';
import axios from 'axios';
import cloudinary from '../config/cloudinary.config';

import { AiGenerationProvider } from './interfaces/ai-provider.interface';
import { Tripo3dProvider } from './providers/tripo3d.provider';
import { Hunyuan3dProvider } from './providers/hunyuan3d.provider';
import { MeshyProvider } from './providers/meshy.provider';
import { LumaAiProvider } from './providers/luma.provider';
import { CustomProvider } from './providers/custom.provider';

@Injectable()
export class AiGenerationService {
  private readonly logger = new Logger(AiGenerationService.name);

  constructor(
    private settingsService: SettingsService,
    private tripo3dProvider: Tripo3dProvider,
    private hunyuan3dProvider: Hunyuan3dProvider,
    private meshyProvider: MeshyProvider,
    private lumaAiProvider: LumaAiProvider,
    private customProvider: CustomProvider
  ) {}

  /**
   * Factory method to get the currently active AI provider.
   */
  private async getActiveProvider(): Promise<AiGenerationProvider> {
    try {
      const activeSetting = await firstValueFrom(this.settingsService.getSettingByKey('ai.activeProvider')).catch(() => null);
      const activeId = activeSetting?.value || 'tripo3d'; // fallback to tripo3d
      
      switch (activeId.toLowerCase()) {
        case 'hunyuan3d': return this.hunyuan3dProvider;
        case 'meshy': return this.meshyProvider;
        case 'luma': return this.lumaAiProvider;
        case 'custom': return this.customProvider;
        case 'tripo3d':
        default:
          return this.tripo3dProvider;
      }
    } catch (error) {
      this.logger.error(`Error resolving active provider: ${error.message}, falling back to tripo3d`);
      return this.tripo3dProvider;
    }
  }

  async generateTask(imageUrl: string, isHq: boolean = false) {
    const provider = await this.getActiveProvider();
    
    // If it's the custom provider, use the setting from the database for HQ mode
    if (provider.providerId === 'custom') {
      const hqSetting = await firstValueFrom(this.settingsService.getSettingByKey('ai.customUseHq')).catch(() => null);
      if (hqSetting) {
        isHq = hqSetting.value === 'true';
      }
    }

    this.logger.log(`Delegating generateTask to ${provider.providerId} (HQ: ${isHq})`);
    
    const result = await provider.generateTask(imageUrl, isHq);
    return {
      code: 0,
      data: { task_id: result.taskId }, // Align with legacy frontend
      message: 'success'
    };
  }

  async getTaskStatus(taskId: string) {
    const provider = await this.getActiveProvider();
    const result = await provider.getTaskStatus(taskId);
    
    // Convert AiTaskResult to frontend TripoStatusResponse schema
    return {
      code: 0,
      data: {
        task_id: result.taskId,
        status: result.status,
        progress: result.progress,
        result: {
          model: result.modelUrl || null
        }
      },
      message: 'success'
    };
  }

  async listTasks() {
    const provider = await this.getActiveProvider();
    return provider.listTasks();
  }

  /**
   * Downloads a model from any provider URL and uploads it to Cloudinary.
   */
  async downloadModel(url: string, filename: string) {
    try {
      this.logger.log(`Downloading model from ${url} for permanent storage...`);
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(response.data);

      this.logger.log(`Uploading model to Cloudinary (${buffer.length} bytes)...`);

      // Use upload_stream with chunk_size to support files > 10MB (Raw/GLB)
      const uploadPromise = new Promise<any>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'product-3d-models',
            resource_type: 'raw',
            public_id: filename.replace('.glb', ''),
            chunk_size: 6000000, // 6MB chunks
            timeout: 600000
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
        uploadStream.end(buffer);
      });

      const result = await uploadPromise;
      this.logger.log(`Model successfully archived at ${result.secure_url}`);

      return {
        success: true,
        path: result.secure_url
      };
    } catch (error) {
      this.logger.error(`Persistent upload failed: ${error.message}`);
      throw new HttpException(`Persistent upload failed: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
