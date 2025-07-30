import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';
import { ErrorHandlerService } from '../../../services/error-handler.service';

export interface ProcessingOptions {
  removeBackground: boolean;
  optimize: boolean;
}

export interface ProcessedImageResult {
  url: string;
  format: string;
  processed: boolean;
  originalFormat: string;
  size: number;
}

@Component({
  selector: 'app-image-processor',
  templateUrl: './image-processor.component.html',
  styleUrls: ['./image-processor.component.scss']
})
export class ImageProcessorComponent {
  @Input() label = 'Upload Image';
  @Input() placeholder = 'Select image to process';
  @Input() control: FormControl = new FormControl();
  @Input() processingOptions: ProcessingOptions = {
    removeBackground: true,
    optimize: true
  };
  
  @Output() fileSelected = new EventEmitter<File>();
  @Output() fileProcessed = new EventEmitter<ProcessedImageResult>();
  @Output() processingError = new EventEmitter<string>();

  isProcessing = false;
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  processedUrl: string | null = null;

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {}

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.fileSelected.emit(file);
      this.createPreview(file);
      this.processImage();
    }
  }

  private createPreview(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.previewUrl = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  private async processImage(): Promise<void> {
    if (!this.selectedFile) return;

    this.isProcessing = true;

    try {
      const formData = new FormData();
      formData.append('image', this.selectedFile);
      formData.append('removeBackground', this.processingOptions.removeBackground.toString());
      formData.append('optimize', this.processingOptions.optimize.toString());

      const result = await this.http.post<ProcessedImageResult>(
        `${environment.apiUrl}/uploads/process-image`,
        formData
      ).toPromise();

                        if (result) {
                    this.processedUrl = result.url;
                    this.control.setValue(result.url);
                    this.fileProcessed.emit(result);
                    this.errorHandler.showSuccess('Image processed successfully!');
                  }
                    } catch (error: any) {
                  const errorMessage = error.error?.message || 'Failed to process image';
                  this.processingError.emit(errorMessage);
                  this.errorHandler.showImageProcessingError(error);
                } finally {
      this.isProcessing = false;
    }
  }

  removeImage(): void {
    this.selectedFile = null;
    this.previewUrl = null;
    this.processedUrl = null;
    this.control.setValue('');
  }

  getFileSize(size: number): string {
    if (size < 1024) return size + ' B';
    if (size < 1024 * 1024) return (size / 1024).toFixed(1) + ' KB';
    return (size / (1024 * 1024)).toFixed(1) + ' MB';
  }
} 