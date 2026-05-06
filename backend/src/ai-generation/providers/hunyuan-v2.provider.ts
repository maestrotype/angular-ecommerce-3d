import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { SettingsService } from '../../settings/settings.service';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { AiGenerationProvider, AiTaskResult } from '../interfaces/ai-provider.interface';

@Injectable()
export class HunyuanV2Provider implements AiGenerationProvider {
  private readonly logger = new Logger(HunyuanV2Provider.name);

  constructor(
    private settingsService: SettingsService,
    private httpService: HttpService
  ) {}

  get providerId(): string {
    return 'hunyuan_v2';
  }

  private async getWorkerUrl(): Promise<string> {
    // Priority: Local Worker (if M4 Max) or Cloud Endpoint
    const setting = await firstValueFrom(this.settingsService.getSettingByKey('ai.customUrl')).catch(() => null);
    const baseUrl = (setting?.value?.trim() || 'http://127.0.0.1:8000').replace(/\/generate$/, '');
    return `${baseUrl}/generate/hunyuan3d-v2`;
  }

  async generateTask(imageUrl: string, isHq: boolean = true): Promise<{ taskId: string }> {
    const workerUrl = await this.getWorkerUrl();
    try {
      this.logger.log(`Hunyuan3D v2 (SOTA Free) calling worker at ${workerUrl} for ${imageUrl}`);
      const response = await firstValueFrom(
        this.httpService.post(
          workerUrl,
          { image_url: imageUrl, action: 'generate', model: 'hunyuan_v2', hq: isHq },
          { headers: { 'Content-Type': 'application/json' } }
        )
      );
      
      return { taskId: response.data.task_id || response.data.id };
    } catch (error) {
      this.handleError(error, 'generateTask');
    }
  }

  async getTaskStatus(taskId: string): Promise<AiTaskResult> {
    const setting = await firstValueFrom(this.settingsService.getSettingByKey('ai.customUrl')).catch(() => null);
    const baseUrl = (setting?.value?.trim() || 'http://127.0.0.1:8000').replace(/\/generate$/, '');
    const statusUrl = `${baseUrl}/generate/${taskId}`;

    try {
      const response = await firstValueFrom(this.httpService.get(statusUrl));
      const data = response.data;
      
      return {
        taskId: data.task_id || taskId,
        status: data.status || 'running',
        progress: data.progress || 0,
        modelUrl: data.model_url || null,
        localPath: data.local_path || null,
        error: data.error || null
      };
    } catch (error) {
      this.handleError(error, 'getTaskStatus');
    }
  }

  async listTasks(): Promise<any> {
    return { code: 0, data: [], message: 'History not implemented' };
  }

  private handleError(error: any, context: string): never {
    const status = error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
    const message = error.response?.data?.message || error.message;
    this.logger.error(`Error in HunyuanV2Provider.${context}: ${message}`);
    throw new HttpException(`Hunyuan3D v2 Error: ${message}`, status);
  }
}
