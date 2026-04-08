import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { SettingsService } from '../../settings/settings.service';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { AiGenerationProvider, AiTaskResult } from '../interfaces/ai-provider.interface';

@Injectable()
export class CustomProvider implements AiGenerationProvider {
  private readonly logger = new Logger(CustomProvider.name);

  constructor(
    private settingsService: SettingsService,
    private httpService: HttpService
  ) {}

  get providerId(): string {
    return 'custom';
  }

  private async getWebhookUrl(): Promise<string> {
    const setting = await firstValueFrom(this.settingsService.getSettingByKey('ai.custom.url')).catch(() => null);
    if (!setting?.value?.trim()) {
      throw new HttpException('Custom Webhook URL not configured', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return setting.value.trim();
  }

  async generateTask(imageUrl: string): Promise<{ taskId: string }> {
    const webhookUrl = await this.getWebhookUrl();
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          webhookUrl,
          { image_url: imageUrl, action: 'generate' },
          { headers: { 'Content-Type': 'application/json' } }
        )
      );
      
      return { taskId: response.data.task_id || response.data.id || 'custom-' + Date.now() };
    } catch (error) {
      this.handleError(error, 'generateTask');
    }
  }

  async getTaskStatus(taskId: string): Promise<AiTaskResult> {
    const webhookUrl = await this.getWebhookUrl();
    try {
      // Assuming GET with taskId for status
      const response = await firstValueFrom(
        this.httpService.get(`${webhookUrl}/${taskId}`)
      );
      const data = response.data;
      
      return {
        taskId: data.task_id || taskId,
        status: data.status || 'running',
        progress: data.progress || 0,
        modelUrl: data.model_url || null
      };
    } catch (error) {
      this.handleError(error, 'getTaskStatus');
    }
  }

  async listTasks(): Promise<any> {
    return { code: 0, data: [], message: 'Custom webhook history not implemented' };
  }

  private handleError(error: any, context: string): never {
    const status = error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
    const message = error.response?.data?.message || error.message;
    this.logger.error(`Error in CustomProvider.${context}: ${message}`);
    throw new HttpException(`Custom API Error: ${message}`, status);
  }
}
