import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { SettingsService } from '../../settings/settings.service';
import { firstValueFrom } from 'rxjs';
import { AiGenerationProvider, AiTaskResult } from '../interfaces/ai-provider.interface';

@Injectable()
export class Tripo3dProvider implements AiGenerationProvider {
  private readonly logger = new Logger(Tripo3dProvider.name);
  private readonly baseUrl = 'https://api.tripo3d.ai/v2/openapi';

  constructor(
    private configService: ConfigService,
    private settingsService: SettingsService,
    private httpService: HttpService
  ) {}

  get providerId(): string {
    return 'tripo3d';
  }

  private async getApiKey(): Promise<string> {
    try {
      // Note: In the new schema, we check ai.tripo3d.apiKey first, but let's fall back to tripo3d.apiKey
      const newSetting = await firstValueFrom(this.settingsService.getSettingByKey('ai.tripoApiKey')).catch(() => null);
      if (newSetting?.value?.trim()) return newSetting.value.trim();

      const oldSetting = await firstValueFrom(this.settingsService.getSettingByKey('tripo3d.apiKey')).catch(() => null);
      if (oldSetting?.value?.trim()) return oldSetting.value.trim();
    } catch (error) {
      this.logger.warn(`Failed to fetch Tripo3D API key: ${error.message}`);
    }

    const envKey = this.configService.get<string>('TRIPO_API_KEY');
    if (!envKey) {
      throw new HttpException('Tripo3D API key not configured', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return envKey.trim();
  }

  async generateTask(imageUrl: string): Promise<{ taskId: string }> {
    const apiKey = await this.getApiKey();

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/task`,
          {
            type: 'image_to_model',
            file: {
              type: imageUrl.toLowerCase().endsWith('.png') ? 'png' : 'jpg',
              url: imageUrl
            },
            model_version: 'v2.0-20240919'
          },
          { headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' } }
        )
      );
      
      return { taskId: response.data.data.task_id };
    } catch (error) {
      this.handleError(error, 'generateTask');
    }
  }

  async getTaskStatus(taskId: string): Promise<AiTaskResult> {
    const apiKey = await this.getApiKey();

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/task/${taskId}`, {
          headers: { Authorization: `Bearer ${apiKey}` },
        })
      );
      
      const task = response.data.data;
      return {
        taskId: task.task_id,
        status: task.status,
        progress: task.progress || 0,
        modelUrl: task.result?.pbr_model?.url || null // Tripo3D V2 fix
      };
    } catch (error) {
      this.handleError(error, 'getTaskStatus');
    }
  }

  async listTasks(): Promise<any> {
    const apiKey = await this.getApiKey();
    const url = `${this.baseUrl}/task`;
    
    try {
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          params: { limit: 20 }
        })
      );
      
      return {
        code: 0,
        data: response.data?.data || [],
        message: 'success'
      };
    } catch (error) {
      const status = error.response?.status;
      if (status === 405 || status === 404) {
        return { code: 0, data: [], message: 'History not supported by this API version' };
      }
      this.handleError(error, 'listTasks');
    }
  }

  private handleError(error: any, context: string): never {
    const status = error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
    const message = error.response?.data?.message || error.message;
    this.logger.error(`Error in Tripo3dProvider.${context}: ${message}`);
    throw new HttpException(`API_ERROR.TRIPO_API_ERROR: ${message}`, status);
  }
}
