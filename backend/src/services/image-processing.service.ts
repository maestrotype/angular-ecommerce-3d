import { Injectable, Logger } from '@nestjs/common';
import * as sharp from 'sharp';
import axios from 'axios';
import * as FormData from 'form-data';
import { imageProcessingConfig } from '../config/image-processing.config';
import { Observable, from, throwError } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';

export interface ProcessedImageResult {
  originalUrl: string;
  processedUrl: string;
  format: string;
  size: number;
}

@Injectable()
export class ImageProcessingService {
  private readonly logger = new Logger(ImageProcessingService.name);

  processImageWithBackgroundRemoval(
    imageBuffer: Buffer,
    originalFormat: string
  ): Observable<Buffer> {
    if (!imageProcessingConfig.removeBgApiKey) {
      this.logger.warn('Remove.bg API key not configured, processing image without background removal');
      return this.optimizeImage(imageBuffer);
    }

    return this.removeBackground(imageBuffer).pipe(
      switchMap(processedBuffer => this.convertToPng(processedBuffer)),
      catchError(error => {
        this.logger.error('Error processing image with background removal:', error);
        return this.optimizeImage(imageBuffer);
      })
    );
  }

  private removeBackground(imageBuffer: Buffer): Observable<Buffer> {
    try {
      const formData = new FormData();
      formData.append('image_file', imageBuffer, {
        filename: 'image.jpg',
        contentType: 'image/jpeg'
      });
      formData.append('size', 'auto');
      
      return from(axios.post(
        imageProcessingConfig.removeBgApiUrl,
        formData,
        {
          headers: {
            'X-Api-Key': imageProcessingConfig.removeBgApiKey,
            ...formData.getHeaders(),
          },
          responseType: 'arraybuffer',
        }
      )).pipe(
        map(response => Buffer.from(response.data)),
        catchError(error => {
          this.logger.error('Remove.bg API error:', error.response?.data || error.message);
          return throwError(() => new Error('Failed to remove background'));
        })
      );
    } catch (error) {
      this.logger.error('Remove.bg API error:', error);
      return throwError(() => new Error('Failed to remove background'));
    }
  }

  convertToPng(imageBuffer: Buffer): Observable<Buffer> {
    return from(sharp(imageBuffer)
      .png(imageProcessingConfig.sharpOptions)
      .toBuffer()
    ).pipe(
      catchError(error => {
        this.logger.error('PNG conversion error:', error);
        return throwError(() => error);
      })
    );
  }

  optimizeImage(imageBuffer: Buffer): Observable<Buffer> {
    return from(sharp(imageBuffer)
      .resize(1200, 1200, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .png({ quality: 90 })
      .toBuffer()
    ).pipe(
      catchError(error => {
        this.logger.error('Image optimization error:', error);
        return throwError(() => error);
      })
    );
  }

  createThumbnail(imageBuffer: Buffer, size: number = 300): Observable<Buffer> {
    return from(sharp(imageBuffer)
      .resize(size, size, {
        fit: 'cover',
        position: 'center'
      })
      .png({ quality: 80 })
      .toBuffer()
    ).pipe(
      catchError(error => {
        this.logger.error('Thumbnail creation error:', error);
        return throwError(() => error);
      })
    );
  }

  validateImageFormat(filename: string): boolean {
    const extension = filename.split('.').pop()?.toLowerCase();
    return imageProcessingConfig.supportedFormats.includes(extension);
  }

  validateFileSize(fileSize: number): boolean {
    return fileSize <= imageProcessingConfig.maxFileSize;
  }
} 