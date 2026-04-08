import { Injectable, Logger, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { SettingsService } from '../settings/settings.service';
import { firstValueFrom } from 'rxjs';
import { join } from 'path';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import axios from 'axios';

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

  async generateTask(imageUrl: string) {
    const provider = await this.getActiveProvider();
    this.logger.log(`Delegating generateTask to ${provider.providerId}`);
    
    const result = await provider.generateTask(imageUrl);
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
   * Generic method to download a model from any provider URL.
   */
  async downloadModel(url: string, filename: string) {
    try {
      this.logger.log(`Downloading model from ${url} to ${filename}`);
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(response.data);

      const uploadPath = join(__dirname, '..', '..', 'uploads', 'models');
      if (!existsSync(uploadPath)) {
        mkdirSync(uploadPath, { recursive: true });
      }

      const filePath = join(uploadPath, filename);
      writeFileSync(filePath, buffer);

      this.logger.log(`Model saved to ${filePath}`);
      return {
        success: true,
        path: `/uploads/models/${filename}`
      };
    } catch (error) {
      this.logger.error(`Failed to download model: ${error.message}`);
      throw new HttpException('Failed to download model', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
