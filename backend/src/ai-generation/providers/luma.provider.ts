import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { SettingsService } from '../../settings/settings.service';
import { firstValueFrom } from 'rxjs';
import { AiGenerationProvider, AiTaskResult } from '../interfaces/ai-provider.interface';

@Injectable()
export class LumaAiProvider implements AiGenerationProvider {
  private readonly logger = new Logger(LumaAiProvider.name);

  constructor(private settingsService: SettingsService) {}

  get providerId(): string {
    return 'luma';
  }

  private async getApiKey(): Promise<string> {
    const setting = await firstValueFrom(this.settingsService.getSettingByKey('ai.luma.apiKey')).catch(() => null);
    if (!setting?.value?.trim()) {
      throw new HttpException('Luma AI API key not configured', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return setting.value.trim();
  }

  async generateTask(imageUrl: string): Promise<{ taskId: string }> {
    const apiKey = await this.getApiKey();
    this.logger.log(`Luma AI generateTask called for ${imageUrl}`);
    throw new HttpException('Luma AI integration is pending implementation details', HttpStatus.NOT_IMPLEMENTED);
  }

  async getTaskStatus(taskId: string): Promise<AiTaskResult> {
    throw new HttpException('Luma AI integration is pending implementation details', HttpStatus.NOT_IMPLEMENTED);
  }

  async listTasks(): Promise<any> {
    return { code: 0, data: [], message: 'Luma AI history not implemented' };
  }
}
