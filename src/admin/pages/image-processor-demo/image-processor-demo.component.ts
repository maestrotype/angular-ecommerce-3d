import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ProcessingOptions, ProcessedImageResult } from '../../components/ui/image-processor/image-processor.component';

@Component({
  selector: 'app-image-processor-demo',
  templateUrl: './image-processor-demo.component.html',
  styleUrls: ['./image-processor-demo.component.scss']
})
export class ImageProcessorDemoComponent {
  imageControl = new FormControl('', [Validators.required]);
  
  processingOptions: ProcessingOptions = {
    removeBackground: true,
    optimize: true
  };

  processedResults: ProcessedImageResult[] = [];

  onFileProcessed(result: ProcessedImageResult): void {
    this.processedResults.push(result);
    console.log('Image processed:', result);
  }

  onProcessingError(error: string): void {
    console.error('Processing error:', error);
  }

  updateProcessingOptions(): void {
    console.log('Processing options updated:', this.processingOptions);
  }
} 