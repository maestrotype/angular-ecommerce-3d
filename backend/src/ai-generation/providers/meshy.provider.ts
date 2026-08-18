import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { SettingsService } from '../../settings/settings.service';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { AiGenerationProvider, AiTaskResult } from '../interfaces/ai-provider.interface';

@Injectable()
export class MeshyProvider implements AiGenerationProvider {
  private readonly logger = new Logger(MeshyProvider.name);

  constructor(
    private settingsService: SettingsService,
    private httpService: HttpService
  ) {}

  get providerId(): string {
    return 'meshy';
  }

  private async getApiKey(): Promise<string> {
    const setting = await firstValueFrom(this.settingsService.getSettingByKey('ai.meshyApiKey')).catch(() => null);
    if (!setting?.value?.trim()) {
      throw new HttpException('Meshy API key not configured', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return setting.value.trim();
  }

  async generateTask(imageUrl: string): Promise<{ taskId: string }> {
    const apiKey = await this.getApiKey();
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          'https://api.meshy.ai/openapi/v1/image-to-3d',
          {
            image_url: imageUrl,
            ai_model: 'latest',
            enable_pbr: true,
            should_remesh: true,
            should_texture: true,
          },
          { headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' } }
        )
      );

      const taskId = response.data.result ?? response.data.result ?? response.data.id;
      if (!taskId) {
        throw new HttpException('Meshy did not return a task id', HttpStatus.BAD_GATEWAY);
      }
      return { taskId };
    } catch (error) {
      this.handleError(error, 'generateTask');
    }
  }

  async getTaskStatus(taskId: string): Promise<AiTaskResult> {
    const apiKey = await this.getApiKey();
    try {
      const response = await firstValueFrom(
        this.httpService.get(`https://api.meshy.ai/openapi/v1/image-to-3d/${taskId}`, {
          headers: { Authorization: `Bearer ${apiKey}` },
        })
      );

      const task = response.data;
      let status: 'queued' | 'running' | 'success' | 'failed' = 'running';

      if (task.status === 'SUCCEEDED') status = 'success';
      else if (task.status === 'FAILED' || task.status === 'EXPIRED') status = 'failed';
      else if (task.status === 'PENDING') status = 'queued';

      return {
        taskId: task.id || taskId,
        status,
        progress: task.progress || 0,
        modelUrl: task.model_urls?.glb || null,
        error: task.task_error?.message || undefined,
      };
    } catch (error) {
      this.handleError(error, 'getTaskStatus');
    }
  }

  async listTasks(): Promise<any> {
    const apiKey = await this.getApiKey();
    try {
      const response = await firstValueFrom(
        this.httpService.get('https://api.meshy.ai/openapi/v1/image-to-3d', {
          headers: { Authorization: `Bearer ${apiKey}` },
          params: { page: 1, limit: 20 }
        })
      );
      
      return {
        code: 0,
        data: response.data || [],
        message: 'success'
      };
    } catch (error) {
      this.handleError(error, 'listTasks');
    }
  }

  private handleError(error: any, context: string): never {
    const status = error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
    const message = error.response?.data?.message || error.message;
    this.logger.error(`Error in MeshyProvider.${context}: ${message}`);
    throw new HttpException(`API_ERROR.MESHY_API_ERROR: ${message}`, status);
  }
}
