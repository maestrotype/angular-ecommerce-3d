import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { SettingsService } from '../settings/settings.service';
import { firstValueFrom } from 'rxjs';
import axios from 'axios';
import cloudinary from '../config/cloudinary.config';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

import { AiGenerationProvider, AiTaskResult } from './interfaces/ai-provider.interface';
import { Tripo3dProvider } from './providers/tripo3d.provider';
import { Hunyuan3dProvider } from './providers/hunyuan3d.provider';
import { MeshyProvider } from './providers/meshy.provider';
import { LumaAiProvider } from './providers/luma.provider';
import { CustomProvider } from './providers/custom.provider';
import { Unique3dProvider } from './providers/unique3d.provider';
import { HunyuanV2Provider } from './providers/hunyuan-v2.provider';

@Injectable()
export class AiGenerationService {
  private readonly logger = new Logger(AiGenerationService.name);

  constructor(
    private settingsService: SettingsService,
    private tripo3dProvider: Tripo3dProvider,
    private hunyuan3dProvider: Hunyuan3dProvider,
    private meshyProvider: MeshyProvider,
    private lumaAiProvider: LumaAiProvider,
    private customProvider: CustomProvider,
    private unique3dProvider: Unique3dProvider,
    private hunyuanV2Provider: HunyuanV2Provider
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
        case 'unique3d': return this.unique3dProvider;
        case 'hunyuan_v2': return this.hunyuanV2Provider;
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
    
    try {
      const result = await provider.generateTask(imageUrl, isHq);
      return {
        code: 0,
        data: { task_id: result.taskId }, // Align with legacy frontend
        message: 'success'
      };
    } catch (error) {
      this.logger.error(`Generation failed for ${provider.providerId}: ${error.message}`);
      return {
        code: 1,
        message: error.message || 'AI generation service unreachable'
      };
    }
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
        error: result.error,
        localPath: result.localPath,
        result: {
          model: result.modelUrl || null
        }
      },
      message: result.error || 'success'
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
    try {
      this.logger.log(`Downloading model from ${url} for optimization and storage...`);
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(response.data);

      // 1. Save HQ file locally
      const uploadsDir = path.join(__dirname, '..', '..', 'uploads', 'products-3d');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const hqFilename = filename.replace('.glb', '_hq.glb');
      const hqFilePath = path.join(uploadsDir, hqFilename);
      fs.writeFileSync(hqFilePath, buffer);
      this.logger.log(`Saved high-quality model locally at ${hqFilePath}`);

      // 2. Optimize the file using gltf-transform
      const optFilename = filename.replace('.glb', '_opt.glb');
      const optFilePath = path.join(uploadsDir, optFilename);
      
      this.logger.log(`Optimizing model using gltf-transform...`);
      try {
        // Run gltf-transform to optimize geometry and textures
        await execAsync(`npx gltf-transform optimize "${hqFilePath}" "${optFilePath}" --texture-compress webp`);
        this.logger.log(`Model optimization complete.`);
      } catch (optError) {
        this.logger.warn(`Optimization failed, falling back to original model for cloud upload: ${optError.message}`);
        // Fallback to the original file if optimization fails
        fs.copyFileSync(hqFilePath, optFilePath);
      }

      // 3. Upload Optimized Model to Cloudinary
      const optBuffer = fs.readFileSync(optFilePath);
      this.logger.log(`Uploading optimized model to Cloudinary (${optBuffer.length} bytes)...`);

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
        uploadStream.end(optBuffer);
      });

      const result = await uploadPromise;
      this.logger.log(`Model successfully archived at ${result.secure_url}`);

      // 4. Clean up temporary optimized file
      if (fs.existsSync(optFilePath)) {
        fs.unlinkSync(optFilePath);
      }

      return {
        success: true,
        path: result.secure_url, // Optimized Cloud URL
        localPath: `/uploads/products-3d/${hqFilename}`, // High-Quality Local URL
        publicId: result.public_id
      };
    } catch (error) {
      this.logger.error(`Persistent upload failed: ${error.message}`);
      throw new HttpException(`Persistent upload failed: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
