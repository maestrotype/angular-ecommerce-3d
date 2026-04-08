import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { SettingsService } from '../../settings/settings.service';
import { firstValueFrom } from 'rxjs';
import { AiGenerationProvider, AiTaskResult } from '../interfaces/ai-provider.interface';

@Injectable()
export class CustomProvider implements AiGenerationProvider {
  private readonly logger = new Logger(CustomProvider.name);

  constructor(private settingsService: SettingsService) {}

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
    this.logger.log(`Custom Webhook generateTask called for ${imageUrl} at ${webhookUrl}`);
    throw new HttpException('Custom Webhook implementation is pending', HttpStatus.NOT_IMPLEMENTED);
  }

  async getTaskStatus(taskId: string): Promise<AiTaskResult> {
    throw new HttpException('Custom Webhook implementation is pending', HttpStatus.NOT_IMPLEMENTED);
  }

  async listTasks(): Promise<any> {
    return { code: 0, data: [], message: 'Custom webhook history not implemented' };
  }
}
