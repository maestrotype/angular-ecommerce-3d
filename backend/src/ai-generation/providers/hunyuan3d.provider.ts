import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { SettingsService } from '../../settings/settings.service';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { AiGenerationProvider, AiTaskResult } from '../interfaces/ai-provider.interface';

@Injectable()
export class Hunyuan3dProvider implements AiGenerationProvider {
  private readonly logger = new Logger(Hunyuan3dProvider.name);

  constructor(
    private settingsService: SettingsService,
    private httpService: HttpService
  ) {}

  get providerId(): string {
    return 'hunyuan3d';
  }

  private async getApiKey(): Promise<string> {
    const setting = await firstValueFrom(this.settingsService.getSettingByKey('ai.hunyuanApiKey')).catch(() => null);
    if (!setting?.value?.trim()) {
      throw new HttpException('Hunyuan3D API key not configured', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return setting.value.trim();
  }

  async generateTask(imageUrl: string): Promise<{ taskId: string }> {
    const apiKey = await this.getApiKey(); // This would be AccessKeyId:SecretKey
    try {
      this.logger.log(`Hunyuan3D calling Tencent Cloud API for ${imageUrl}`);
      // Tencent Cloud API requires complex V3 signatures. 
      // In a real scenario, we would use tencentcloud-sdk-nodejs.
      // For now, we simulate the request structure for the user's reference.
      const response = await firstValueFrom(
        this.httpService.post(
          'https://threed.tencentcloudapi.com',
          {
            Action: 'CreateHunyuanTo3DRapidJob',
            Version: '2024-09-19',
            ImageUrl: imageUrl,
          },
          { 
            headers: { 
              'Content-Type': 'application/json',
              'X-TC-Action': 'CreateHunyuanTo3DRapidJob'
              // Signature headers would go here
            } 
          }
        )
      );
      
      return { taskId: response.data.Response.JobId };
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        throw new HttpException('Hunyuan3D Authentication Failed (Signature required)', HttpStatus.UNAUTHORIZED);
      }
      this.handleError(error, 'generateTask');
    }
  }

  async getTaskStatus(taskId: string): Promise<AiTaskResult> {
    const apiKey = await this.getApiKey();
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          'https://threed.tencentcloudapi.com',
          {
            Action: 'QueryHunyuanTo3DRapidJob',
            Version: '2024-09-19',
            JobId: taskId,
          },
          { 
            headers: { 
              'Content-Type': 'application/json',
              'X-TC-Action': 'QueryHunyuanTo3DRapidJob'
            } 
          }
        )
      );
      
      const job = response.data.Response;
      let status: 'queued' | 'running' | 'success' | 'failed' = 'running';
      
      if (job.Status === 'Completed') status = 'success';
      else if (job.Status === 'Failed') status = 'failed';
      
      return {
        taskId: job.JobId,
        status,
        progress: job.Progress || 0,
        modelUrl: job.ModelUrl || null
      };
    } catch (error) {
      this.handleError(error, 'getTaskStatus');
    }
  }

  async listTasks(): Promise<any> {
    return { code: 0, data: [], message: 'Hunyuan3D history not implemented via REST' };
  }

  private handleError(error: any, context: string): never {
    const status = error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
    const message = error.response?.data?.Response?.Error?.Message || error.message;
    this.logger.error(`Error in Hunyuan3dProvider.${context}: ${message}`);
    throw new HttpException(`API_ERROR.HUNYUAN_API_ERROR: ${message}`, status);
  }
}
