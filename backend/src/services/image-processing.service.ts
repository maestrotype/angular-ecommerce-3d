import { Injectable, Logger } from '@nestjs/common';
import * as sharp from 'sharp';
import axios from 'axios';
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
      if (!imageProcessingConfig.removeBgApiKey || imageProcessingConfig.removeBgApiKey === 'your_api_key_here') {
        this.logger.warn('Remove.bg API key not configured or invalid, skipping background removal');
        throw new Error('Remove.bg API key not configured. Please add valid REMOVE_BG_API_KEY to .env file');
      }

      const processedBuffer = await this.removeBackground(imageBuffer);
      return this.convertToPng(processedBuffer);
    } catch (error) {
      this.logger.error('Error processing image with background removal:', error);
      throw error;
    }
  }

  private async removeBackground(imageBuffer: Buffer): Promise<Buffer> {
    try {
      const response = await axios.post(
        imageProcessingConfig.removeBgApiUrl,
        imageBuffer,
        {
          headers: {
            'X-Api-Key': imageProcessingConfig.removeBgApiKey,
            'Content-Type': 'application/octet-stream',
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