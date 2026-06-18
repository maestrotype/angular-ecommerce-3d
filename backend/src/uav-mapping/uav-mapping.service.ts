import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import * as FormData from 'form-data';
import * as fs from 'fs';

@Injectable()
export class UavMappingBackendService {
  private readonly logger = new Logger(UavMappingBackendService.name);
  private readonly pythonWorkerUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    // URL Python-сервиса (FastAPI)
    this.pythonWorkerUrl = this.configService.get<string>('PYTHON_WORKER_URL') || 'http://localhost:8001';
  }

  /**
   * Проксирование запроса на обработку видео в Python-сервис.
   * Proxies the video processing request to the Python service.
   */
  async startMapping(
    videoFile: Express.Multer.File,
    polygon: string,
    hints: string,
    images: Express.Multer.File[] = [],
  ) {
    this.logger.log('--- UAV Mapping Start Debug ---');
    this.logger.log(`videoFile details: ${JSON.stringify({
      originalname: videoFile.originalname,
      mimetype: videoFile.mimetype,
      size: videoFile.size,
      path: videoFile.path,
      fieldname: videoFile.fieldname
    })}`);
    
    const formData = new FormData();
    formData.append('video', fs.createReadStream(videoFile.path), videoFile.originalname);
    formData.append('polygon', polygon);
    formData.append('hints', hints);

    for (const img of images) {
      formData.append('images', fs.createReadStream(img.path), img.originalname);
    }

    try {
      this.logger.log(`Forwarding UAV mapping task to ${this.pythonWorkerUrl} (${(videoFile.size / 1024 / 1024).toFixed(2)} MB)`);
      const response = await firstValueFrom(
        this.httpService.post(`${this.pythonWorkerUrl}/process-drone-video`, formData, {
          headers: { ...formData.getHeaders() },
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
          timeout: 600000, // 10 minutes
        }),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to connect to Python service: ${error.message}`);
      throw new HttpException(
        'UAV Mapping Service Unavailable',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  /**
   * Получение статуса задачи.
   * Gets task status from the Python service.
   */
  async getTaskStatus(taskId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.pythonWorkerUrl}/task-status/${taskId}`),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Error polling task ${taskId}: ${error.message}`);
      const status = error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
      throw new HttpException('Status polling failed', status);
    }
  }

  /**
   * Остановка задачи.
   * Stops a running task in the Python service.
   */
  async stopTask(taskId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.pythonWorkerUrl}/stop/${taskId}`),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Error stopping task ${taskId}: ${error.message}`);
      const status = error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
      throw new HttpException('Failed to stop task', status);
    }
  }

  /**
   * Геолокация одиночного изображения.
   * Geolocates a single image within a search area.
   */
  async geolocateImage(imageFile: Express.Multer.File, bounds: string) {
    const formData = new FormData();
    formData.append('image', fs.createReadStream(imageFile.path), imageFile.originalname);
    formData.append('bounds', bounds);

    try {
      this.logger.log(`Forwarding image geolocation request to ${this.pythonWorkerUrl}`);
      const response = await firstValueFrom(
        this.httpService.post(`${this.pythonWorkerUrl}/geolocate-image`, formData, {
          headers: { ...formData.getHeaders() },
          timeout: 600000, // 10 minutes (increased to prevent 500 timeouts on larger areas)
        }),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Geolocation failed: ${error.message}`);
      throw new HttpException('Geolocation service failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Геолокация нескольких изображений.
   * Geolocates multiple images and builds a route.
   */
  async geolocateMultiImages(imageFiles: Express.Multer.File[], bounds: string) {
    const formData = new FormData();
    for (const file of imageFiles) {
      formData.append('images', fs.createReadStream(file.path), file.originalname);
    }
    formData.append('bounds', bounds);

    try {
      this.logger.log(`Forwarding ${imageFiles.length} images for multi-geolocation to Python`);
      const response = await firstValueFrom(
        this.httpService.post(`${this.pythonWorkerUrl}/geolocate-multi-images`, formData, {
          headers: { ...formData.getHeaders() },
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
          timeout: imageFiles.length * 600000, // 10 minutes per image
        }),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Multi-geolocation failed: ${error.message}`);
      throw new HttpException('Multi-geolocation service failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Получение результатов выполненной задачи.
   * Gets task result from the Python service.
   */
  async getTaskResult(taskId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.pythonWorkerUrl}/task-result/${taskId}`),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Error fetching task result ${taskId}: ${error.message}`);
      const status = error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
      throw new HttpException('Result fetch failed', status);
    }
  }
}
