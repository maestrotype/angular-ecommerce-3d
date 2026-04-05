import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { SettingsService } from '../settings/settings.service';
import { firstValueFrom } from 'rxjs';
import { join } from 'path';
import { writeFileSync, mkdirSync, existsSync, createWriteStream } from 'fs';
import axios from 'axios';

@Injectable()
export class Tripo3DService {
  private readonly logger = new Logger(Tripo3DService.name);
  private readonly baseUrl = 'https://api.tripo3d.ai/v2/openapi';

  constructor(
    private readonly httpService: HttpService,
    private readonly settingsService: SettingsService,
  ) {}

  public async getApiKey(): Promise<string> {
    const settings = await firstValueFrom(this.settingsService.getSettingsGrouped());
    const apiKey = settings.tripo3d?.apiKey;
    if (!apiKey) {
      throw new HttpException('Tripo3D API key not configured', HttpStatus.BAD_REQUEST);
    }
    return apiKey;
  }

  async generateModelFromImage(imageUrl: string): Promise<any> {
    const apiKey = await this.getApiKey();
    
    this.logger.log(`Starting Tripo3D generation for image: ${imageUrl}`);

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/task`,
          {
            type: 'image_to_model',
            file: {
              type: imageUrl.split('.').pop()?.toLowerCase() || 'png',
              url: imageUrl,
            },
          },
          {
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      return response.data;
    } catch (error) {
      const errorData = error.response?.data;
      this.logger.error('Tripo3D API error:', errorData || error.message);
      
      // Return the actual error from Tripo3D so we can debug it
      throw new HttpException({
        message: errorData?.message || 'Tripo3D API Error',
        success: false,
        tripoError: errorData
      }, error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }


  }

  async getTaskStatus(taskId: string): Promise<any> {
    const apiKey = await this.getApiKey();

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/task/${taskId}`, {
          headers: { Authorization: `Bearer ${apiKey}` },
          timeout: 10000, // 10s timeout for status check
        }),
      );

      if (response.data?.code !== 0) {
        throw new Error(response.data?.message || 'Tripo3D API returned an error code');
      }

      const statusData = response.data?.data;
      if (statusData) {
        this.logger.log(`[Tripo3D] Task ${taskId} status: ${statusData.status} | Progress: ${statusData.progress}%`);
      }

      return response.data;

    } catch (error) {
      this.logger.error(`Error checking task status ${taskId}:`, error.response?.data || error.message);
      throw new HttpException(
        error.response?.data?.message || 'Failed to check task status',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }


  async listTasks(limit: number = 10): Promise<any> {
    const apiKey = await this.getApiKey();

    try {
      this.logger.log(`Fetching last ${limit} AI tasks from Tripo3D...`);
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/task`, {
          params: { limit },
          headers: { Authorization: `Bearer ${apiKey}` },
        }),
      );

      this.logger.log(`Tripo3D list response code: ${response.data?.code}`);
      
      if (response.data?.code !== 0) {
        this.logger.warn(`Tripo3D list returned non-zero code: ${response.data?.code}`, response.data);
      }

      return response.data;
    } catch (error) {
      const errorData = error.response?.data;
      this.logger.error('Failed to list Tripo3D tasks:', errorData || error.message);
      throw new HttpException(
        errorData?.message || error.message || 'Failed to fetch recent tasks', 
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

  }

  async downloadModel(url: string, filename: string): Promise<string> {

    const uploadPath = join(__dirname, '..', '..', 'uploads', 'products-3d');
    const filePath = join(uploadPath, filename);

    this.logger.log(`Starting download of model from: ${url}`);
    this.logger.log(`Target path: ${filePath}`);

    try {
      if (!existsSync(uploadPath)) {
        mkdirSync(uploadPath, { recursive: true });
        this.logger.log(`Created directory: ${uploadPath}`);
      }

      const writer = createWriteStream(filePath);
      const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream',
        timeout: 60000, // 1 minute timeout
      });

      response.data.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on('finish', () => {
          this.logger.log(`Successfully downloaded model: ${filename}`);
          resolve(`uploads/products-3d/${filename}`);
        });
        writer.on('error', (err) => {
          this.logger.error(`Writer error: ${err.message}`);
          reject(err);
        });
        response.data.on('error', (err) => {
          this.logger.error(`Stream error: ${err.message}`);
          reject(err);
        });
      });
    } catch (error) {
      this.logger.error(`Download failed: ${error.message}`);
      throw error;
    }
  }
}
