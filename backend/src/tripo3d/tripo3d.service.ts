import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { SettingsService } from '../settings/settings.service';
import { firstValueFrom } from 'rxjs';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

@Injectable()
export class Tripo3dService {
  private readonly logger = new Logger(Tripo3dService.name);
  private readonly baseUrl = 'https://api.tripo3d.ai/v2/openapi';

  constructor(
    private configService: ConfigService,
    private settingsService: SettingsService
  ) {}

  private async getApiKey(): Promise<string> {
    try {
      const setting = await firstValueFrom(this.settingsService.getSettingByKey('tripo3d.apiKey'));
      const dbKey = setting?.value;
      
      if (dbKey && dbKey.trim() !== '') {
        return dbKey.trim();
      }
    } catch (error) {
      this.logger.warn(`Failed to fetch Tripo3D API key: ${error.message}`);
    }

    const envKey = this.configService.get<string>('TRIPO_API_KEY');
    if (!envKey) {
      this.logger.error('Tripo3D API key not configured in DB or .env');
      throw new HttpException('Tripo3D API key not configured', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return envKey.trim();
  }

  async generateTask(imageUrl: string) {
    const apiKey = await this.getApiKey();

    try {
      this.logger.log(`Starting AI generation. Key length: ${apiKey.length}`);
      
      const response = await axios.post(
        `${this.baseUrl}/task`,
        {
          type: 'image_to_model',
          file: {
            type: imageUrl.toLowerCase().endsWith('.png') ? 'png' : 'jpg',
            url: imageUrl
          },
          model_version: 'v2.0-20240919'
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );
      
      this.logger.log(`Success: taskId=${response.data.data.task_id}`);
      
      // Align with Frontend `TripoTaskResponse`
      return {
        code: 0,
        data: {
          task_id: response.data.data.task_id
        },
        message: 'success'
      };
    } catch (error) {
      this.handleError(error, 'generateTask');
    }
  }

  async getTaskStatus(taskId: string) {
    const apiKey = await this.getApiKey();

    try {
      const response = await axios.get(`${this.baseUrl}/task/${taskId}`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });
      
      const task = response.data.data;
      this.logger.log(`Task ${taskId} status: ${task.status}, progress: ${task.progress}%`);
      
      if (task.status === 'success') {
        this.logger.log(`Task Result: ${JSON.stringify(task.result)}`);
      }
      
      // Align with Frontend `TripoStatusResponse`
      return {
        code: 0,
        data: {
          task_id: task.task_id,
          status: task.status,
          progress: task.progress || 0,
          result: {
            // Tripo3D V2 returns model at result.pbr_model.url (NOT result.model)
            model: task.result?.pbr_model?.url || null
          }
        },
        message: 'success'
      };
    } catch (error) {
      this.handleError(error, 'getTaskStatus');
    }
  }

  async listTasks() {
    const apiKey = await this.getApiKey();
    const url = `${this.baseUrl}/task`;
    
    try {
      this.logger.log(`Fetching history from: ${url}`);
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        params: { limit: 20 }
      });
      
      return response.data;
    } catch (error) {
      const status = error.response?.status;
      const errMsg = error.response?.data?.message || error.message;
      
      if (status === 405 || status === 404) {
        this.logger.warn(`Tripo3D history endpoint (${url}) is not supported or returns ${status}. Returning empty list.`);
        return {
          code: 0,
          data: [],
          message: 'History not supported by this API version'
        };
      }
      
      this.logger.error(`History Fetch Error (Status ${status}): ${errMsg}`);
      this.handleError(error, 'listTasks');
    }
  }

  async downloadModel(url: string, filename: string) {
    try {
      this.logger.log(`Downloading model from ${url} to ${filename}`);
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(response.data);

      const uploadPath = join(__dirname, '..', '..', 'uploads', 'models');
      if (!existsSync(uploadPath)) {
        mkdirSync(uploadPath, { recursive: true });
      }

      const filePath = join(uploadPath, filename);
      writeFileSync(filePath, buffer);

      this.logger.log(`Model saved to ${filePath}`);
      return {
        success: true,
        path: `/uploads/models/${filename}`
      };
    } catch (error) {
      this.logger.error(`Failed to download model: ${error.message}`);
      throw new HttpException('Failed to download model', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private handleError(error: any, context: string) {
    const status = error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
    const message = error.response?.data?.message || error.message;
    this.logger.error(`Error in ${context}: ${message}`);
    throw new HttpException(
      `Tripo3D API Error: ${message}`,
      status
    );
  }
}
