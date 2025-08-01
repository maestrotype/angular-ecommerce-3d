import { Injectable, Logger } from '@nestjs/common';
import * as sharp from 'sharp';
import axios from 'axios';
import * as FormData from 'form-data';
import { imageProcessingConfig } from '../config/image-processing.config';

export interface ProcessedImageResult {
  originalUrl: string;
  processedUrl: string;
  format: string;
  size: number;
}

@Injectable()
export class ImageProcessingService {
  private readonly logger = new Logger(ImageProcessingService.name);

  async processImageWithBackgroundRemoval(
    imageBuffer: Buffer,
    originalFormat: string
  ): Promise<Buffer> {
    try {
      if (!imageProcessingConfig.removeBgApiKey) {
        this.logger.warn('Remove.bg API key not configured, processing image without background removal');
        return await this.optimizeImage(imageBuffer);
      }

      const processedBuffer = await this.removeBackground(imageBuffer);
      const pngBuffer = await this.convertToPng(processedBuffer);
      return pngBuffer;
    } catch (error) {
      this.logger.error('Error processing image with background removal:', error);
      return await this.optimizeImage(imageBuffer);
    }
  }

  private async removeBackground(imageBuffer: Buffer): Promise<Buffer> {
    try {
      const formData = new FormData();
      formData.append('image_file', imageBuffer, {
        filename: 'image.jpg',
        contentType: 'image/jpeg'
      });
      formData.append('size', 'auto');
      
      const response = await axios.post(
        imageProcessingConfig.removeBgApiUrl,
        formData,
        {
          headers: {
            'X-Api-Key': imageProcessingConfig.removeBgApiKey,
            ...formData.getHeaders(),
          },
          responseType: 'arraybuffer',
        }
      );

      return Buffer.from(response.data);
    } catch (error) {
      this.logger.error('Remove.bg API error:', error.response?.data || error.message);
      throw new Error('Failed to remove background');
    }
  }

  async convertToPng(imageBuffer: Buffer): Promise<Buffer> {
    return sharp(imageBuffer)
      .png(imageProcessingConfig.sharpOptions)
      .toBuffer();
  }

  async optimizeImage(imageBuffer: Buffer): Promise<Buffer> {
    return sharp(imageBuffer)
      .resize(1200, 1200, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .png({ quality: 90 })
      .toBuffer();
  }

  async createThumbnail(imageBuffer: Buffer, size: number = 300): Promise<Buffer> {
    return sharp(imageBuffer)
      .resize(size, size, {
        fit: 'cover',
        position: 'center'
      })
      .png({ quality: 80 })
      .toBuffer();
  }

  validateImageFormat(filename: string): boolean {
    const extension = filename.split('.').pop()?.toLowerCase();
    return imageProcessingConfig.supportedFormats.includes(extension);
  }

  validateFileSize(fileSize: number): boolean {
    return fileSize <= imageProcessingConfig.maxFileSize;
  }
} 