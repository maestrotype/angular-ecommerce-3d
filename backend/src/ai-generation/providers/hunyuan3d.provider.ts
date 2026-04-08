import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { SettingsService } from '../../settings/settings.service';
import { firstValueFrom } from 'rxjs';
import { AiGenerationProvider, AiTaskResult } from '../interfaces/ai-provider.interface';

@Injectable()
export class Hunyuan3dProvider implements AiGenerationProvider {
  private readonly logger = new Logger(Hunyuan3dProvider.name);

  constructor(private settingsService: SettingsService) {}

  get providerId(): string {
    return 'hunyuan3d';
  }

  private async getApiKey(): Promise<string> {
    const setting = await firstValueFrom(this.settingsService.getSettingByKey('ai.hunyuan.apiKey')).catch(() => null);
    if (!setting?.value?.trim()) {
      throw new HttpException('Hunyuan3D API key not configured', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return setting.value.trim();
  }

  async generateTask(imageUrl: string): Promise<{ taskId: string }> {
    const apiKey = await this.getApiKey();
    this.logger.log(`Hunyuan3D generateTask called for ${imageUrl}`);
    // Implementation requires official API documentation
    throw new HttpException('Hunyuan3D API integration is pending implementation details', HttpStatus.NOT_IMPLEMENTED);
  }

  async getTaskStatus(taskId: string): Promise<AiTaskResult> {
    throw new HttpException('Hunyuan3D API integration is pending implementation details', HttpStatus.NOT_IMPLEMENTED);
  }

  async listTasks(): Promise<any> {
    return { code: 0, data: [], message: 'Hunyuan3D history not implemented' };
  }
}
