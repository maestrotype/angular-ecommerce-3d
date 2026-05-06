import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { SettingsService } from '../../settings/settings.service';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { AiGenerationProvider, AiTaskResult } from '../interfaces/ai-provider.interface';

@Injectable()
export class Unique3dProvider implements AiGenerationProvider {
  private readonly logger = new Logger(Unique3dProvider.name);

  constructor(
    private settingsService: SettingsService,
    private httpService: HttpService
  ) {}

  get providerId(): string {
    return 'unique3d';
  }

  private async getLocalWorkerUrl(): Promise<string> {
    // Unique3D is a local HQ provider, we use the custom URL setting
    const setting = await firstValueFrom(this.settingsService.getSettingByKey('ai.customUrl')).catch(() => null);
    if (!setting?.value?.trim()) {
      return 'http://127.0.0.1:8000/generate/unique3d'; // Default fallback
    }
    // Append the specific unique3d path if it's just the base URL
    const baseUrl = setting.value.trim().replace(/\/generate$/, '');
    return `${baseUrl}/generate/unique3d`;
  }

  async generateTask(imageUrl: string, isHq: boolean = true): Promise<{ taskId: string }> {
    const workerUrl = await this.getLocalWorkerUrl();
    try {
      this.logger.log(`Unique3D (Local HQ) calling worker at ${workerUrl} for ${imageUrl}`);
      const response = await firstValueFrom(
        this.httpService.post(
          workerUrl,
          { image_url: imageUrl, action: 'generate', model: 'unique3d', hq: isHq },
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
    return { code: 0, data: [], message: 'Local worker history not implemented' };
  }

  private handleError(error: any, context: string): never {
    const status = error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
    const message = error.response?.data?.message || error.message;
    this.logger.error(`Error in Unique3dProvider.${context}: ${message}`);
    throw new HttpException(`Unique3D Local Error: ${message}`, status);
  }
}
