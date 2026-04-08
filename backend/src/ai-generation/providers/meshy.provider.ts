import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { SettingsService } from '../../settings/settings.service';
import { firstValueFrom } from 'rxjs';
import { AiGenerationProvider, AiTaskResult } from '../interfaces/ai-provider.interface';

@Injectable()
export class MeshyProvider implements AiGenerationProvider {
  private readonly logger = new Logger(MeshyProvider.name);

  constructor(private settingsService: SettingsService) {}

  get providerId(): string {
    return 'meshy';
  }

  private async getApiKey(): Promise<string> {
    const setting = await firstValueFrom(this.settingsService.getSettingByKey('ai.meshy.apiKey')).catch(() => null);
    if (!setting?.value?.trim()) {
      throw new HttpException('Meshy API key not configured', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return setting.value.trim();
  }

  async generateTask(imageUrl: string): Promise<{ taskId: string }> {
    const apiKey = await this.getApiKey();
    this.logger.log(`Meshy generateTask called for ${imageUrl}`);
    throw new HttpException('Meshy API integration is pending implementation details', HttpStatus.NOT_IMPLEMENTED);
  }

  async getTaskStatus(taskId: string): Promise<AiTaskResult> {
    throw new HttpException('Meshy API integration is pending implementation details', HttpStatus.NOT_IMPLEMENTED);
  }

  async listTasks(): Promise<any> {
    return { code: 0, data: [], message: 'Meshy history not implemented' };
  }
}
