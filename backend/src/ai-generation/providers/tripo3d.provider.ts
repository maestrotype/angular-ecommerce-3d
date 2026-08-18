import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { SettingsService } from '../../settings/settings.service';
import { firstValueFrom } from 'rxjs';
import { AiGenerationProvider, AiTaskResult } from '../interfaces/ai-provider.interface';

/**
 * Tripo3D image-to-model.
 * v2.0-20240919 is deprecated (API error: "please try a higher version").
 * Prefer API v3; fall back to v2 with a current model version until v2 retires Nov 2026.
 */
@Injectable()
export class Tripo3dProvider implements AiGenerationProvider {
  private readonly logger = new Logger(Tripo3dProvider.name);
  private readonly v3Base = 'https://openapi.tripo3d.ai/v3';
  private readonly v2Base = 'https://api.tripo3d.ai/v2/openapi';
  private readonly standardModel = 'v2.5-20250123';
  private readonly hqModel = 'v3.0-20250812';

  constructor(
    private configService: ConfigService,
    private settingsService: SettingsService,
    private httpService: HttpService,
  ) {}

  get providerId(): string {
    return 'tripo3d';
  }

  private async getApiKey(): Promise<string> {
    try {
      const newSetting = await firstValueFrom(this.settingsService.getSettingByKey('ai.tripoApiKey')).catch(() => null);
      if (newSetting?.value?.trim()) {
        return newSetting.value.trim();
      }

      const oldSetting = await firstValueFrom(this.settingsService.getSettingByKey('tripo3d.apiKey')).catch(() => null);
      if (oldSetting?.value?.trim()) {
        return oldSetting.value.trim();
      }
    } catch (error) {
      this.logger.warn(`Failed to fetch Tripo3D API key: ${error.message}`);
    }

    const envKey = this.configService.get<string>('TRIPO_API_KEY');
    if (!envKey) {
      throw new HttpException('Tripo3D API key not configured', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return envKey.trim();
  }

  private authHeaders(apiKey: string) {
    return { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' };
  }

  private fileTypeFromUrl(imageUrl: string): string {
    return imageUrl.toLowerCase().includes('.png') ? 'png' : 'jpg';
  }

  private modelVersion(isHq?: boolean): string {
    return isHq ? this.hqModel : this.standardModel;
  }

  async generateTask(imageUrl: string, isHq?: boolean): Promise<{ taskId: string }> {
    const apiKey = await this.getApiKey();
    const file = {
      type: this.fileTypeFromUrl(imageUrl),
      url: imageUrl,
    };
    const modelVersion = this.modelVersion(isHq);
    const headers = this.authHeaders(apiKey);

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.v3Base}/generation/image-to-model`,
          { file, model_version: modelVersion },
          { headers },
        ),
      );
      const taskId = response.data?.data?.task_id || response.data?.task_id;
      if (!taskId) {
        throw new Error('Tripo3D v3 response did not include a task id');
      }
      return { taskId };
    } catch (v3Error) {
      const v3Status = v3Error.response?.status;
      const v3Message = v3Error.response?.data?.message || v3Error.message;
      this.logger.warn(`Tripo3D v3 create failed (${v3Status || 'network'}): ${v3Message}. Falling back to v2.`);

      try {
        const response = await firstValueFrom(
          this.httpService.post(
            `${this.v2Base}/task`,
            {
              type: 'image_to_model',
              file,
              model_version: modelVersion,
            },
            { headers },
          ),
        );
        return { taskId: response.data.data.task_id };
      } catch (v2Error) {
        this.handleError(v2Error, 'generateTask');
      }
    }
  }

  async getTaskStatus(taskId: string): Promise<AiTaskResult> {
    const apiKey = await this.getApiKey();
    const headers = this.authHeaders(apiKey);

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.v3Base}/tasks/${taskId}`, { headers }),
      );
      return this.mapTask(response.data?.data || response.data);
    } catch (v3Error) {
      try {
        const response = await firstValueFrom(
          this.httpService.get(`${this.v2Base}/task/${taskId}`, { headers }),
        );
        return this.mapTask(response.data.data);
      } catch (v2Error) {
        this.handleError(v2Error, 'getTaskStatus');
      }
    }
  }

  async listTasks(): Promise<any> {
    const apiKey = await this.getApiKey();
    const headers = this.authHeaders(apiKey);

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.v3Base}/tasks`, {
          headers,
          params: { limit: 20 },
        }),
      );
      return {
        code: 0,
        data: response.data?.data || response.data || [],
        message: 'success',
      };
    } catch {
      try {
        const response = await firstValueFrom(
          this.httpService.get(`${this.v2Base}/task`, {
            headers,
            params: { limit: 20 },
          }),
        );
        return {
          code: 0,
          data: response.data?.data || [],
          message: 'success',
        };
      } catch (error) {
        const status = error.response?.status;
        if (status === 405 || status === 404) {
          return { code: 0, data: [], message: 'History not supported by this API version' };
        }
        this.handleError(error, 'listTasks');
      }
    }
  }

  private mapTask(task: any): AiTaskResult {
    const result = task?.result || task?.output || {};
    const modelUrl =
      result.pbr_model?.url ||
      result.model?.url ||
      result.base_model?.url ||
      result.model_url ||
      task?.model_url ||
      null;

    return {
      taskId: task.task_id || task.id,
      status: this.mapStatus(task.status),
      progress: task.progress || 0,
      modelUrl,
      error: task.error || task.message || undefined,
    };
  }

  private mapStatus(status: string): AiTaskResult['status'] {
    const value = (status || '').toLowerCase();
    if (['success', 'succeeded', 'completed', 'done'].includes(value)) {
      return 'success';
    }
    if (['failed', 'error', 'cancelled', 'canceled', 'banned', 'expired'].includes(value)) {
      return 'failed';
    }
    if (['queued', 'pending', 'waiting'].includes(value)) {
      return 'queued';
    }
    return 'running';
  }

  private handleError(error: any, context: string): never {
    const status = error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
    const message =
      error.response?.data?.message ||
      error.response?.data?.error?.message ||
      error.message;
    this.logger.error(`Error in Tripo3dProvider.${context}: ${message}`);
    throw new HttpException(`API_ERROR.TRIPO_API_ERROR: ${message}`, status);
  }
}
