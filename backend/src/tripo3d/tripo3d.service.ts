import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class Tripo3dService {
  private readonly logger = new Logger(Tripo3dService.name);
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.tripo3d.ai/v2/openapi';

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('TRIPO_API_KEY');
    if (!this.apiKey) {
      this.logger.warn('TRIPO_API_KEY is not defined. AI generation will fail until it is added to .env');
    }
  }

  async generateTask(imageUrl: string) {
    if (!this.apiKey) {
      throw new HttpException('Tripo3D API key not configured', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    try {
      this.logger.log(`Starting AI generation for image: ${imageUrl}`);
      const response = await axios.post(
        `${this.baseUrl}/task`,
        {
          type: 'image_to_model',
          url: imageUrl,
          model_version: 'v2.0-20240919'
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );
      
      return {
        taskId: response.data.data.task_id,
        status: 'queued'
      };
    } catch (error) {
      this.handleError(error, 'generateTask');
    }
  }

  async getTaskStatus(taskId: string) {
    if (!this.apiKey) {
      throw new HttpException('Tripo3D API key not configured', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    try {
      const response = await axios.get(`${this.baseUrl}/task/${taskId}`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });
      
      const task = response.data.data;
      return {
        taskId: task.task_id,
        status: task.status, // queued, running, success, failed
        progress: task.progress || 0,
        modelUrl: task.result?.model?.url || null,
        thumbnailUrl: task.result?.thumbnail?.url || null
      };
    } catch (error) {
      this.handleError(error, 'getTaskStatus');
    }
  }

  async listTasks() {
    if (!this.apiKey) return { data: [] };
    
    try {
      const response = await axios.get(`${this.baseUrl}/task`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
        params: { limit: 20 }
      });
      return response.data;
    } catch (error) {
      this.handleError(error, 'listTasks');
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
