# 🖼️ Image Processing with Background Removal

## 📋 Overview

This feature automatically converts JPG images to PNG with transparent background using AI-powered background removal.

## 🚀 Features

- **Automatic Background Removal**: Uses Remove.bg API for AI-powered background removal
- **Format Conversion**: Converts JPG/JPEG/WEBP to PNG with transparency
- **Image Optimization**: Resizes and compresses images for web use
- **Real-time Preview**: Shows original and processed images side by side
- **Batch Processing**: Process multiple images with custom options
- **Cloud Storage**: Automatically uploads to Cloudinary

## 🛠️ Setup Instructions

### 1. Backend Setup

#### Install Dependencies
```bash
cd backend
npm install sharp axios
```

#### Environment Variables
Add to your `.env` file:
```env
REMOVE_BG_API_KEY=your_remove_bg_api_key_here
```

#### Get Remove.bg API Key
1. Go to [Remove.bg](https://www.remove.bg/api)
2. Sign up for a free account
3. Get your API key from the dashboard
4. Add it to your `.env` file

### 2. Frontend Setup

The component is already integrated into the admin module. You can use it in any form:

```html
<app-image-processor
  label="Upload Product Image"
  placeholder="Drop your JPG image here"
  [control]="imageControl"
  [processingOptions]="processingOptions"
  (fileProcessed)="onFileProcessed($event)"
  (processingError)="onProcessingError($event)">
</app-image-processor>
```

## 🎯 Usage Examples

### Basic Usage
```typescript
import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ProcessingOptions, ProcessedImageResult } from './components/ui/image-processor/image-processor.component';

@Component({
  selector: 'app-example',
  template: `
    <app-image-processor
      label="Upload Image"
      [control]="imageControl"
      [processingOptions]="options"
      (fileProcessed)="onProcessed($event)">
    </app-image-processor>
  `
})
export class ExampleComponent {
  imageControl = new FormControl('');
  
  options: ProcessingOptions = {
    removeBackground: true,
    optimize: true
  };

  onProcessed(result: ProcessedImageResult): void {
    console.log('Processed image URL:', result.url);
  }
}
```

### Advanced Usage with Custom Options
```typescript
// Custom processing options
const customOptions: ProcessingOptions = {
  removeBackground: true,  // Remove background using AI
  optimize: false         // Skip optimization for full quality
};

// Handle processing events
onFileProcessed(result: ProcessedImageResult): void {
  console.log('Original format:', result.originalFormat);
  console.log('New format:', result.format);
  console.log('File size:', result.size);
  console.log('Image URL:', result.url);
}

onProcessingError(error: string): void {
  console.error('Processing failed:', error);
  // Show user-friendly error message
}
```

## 🔧 API Endpoints

### Process Image
```
POST /api/uploads/process-image
```

**Request:**
- `image`: File (JPG, PNG, WEBP)
- `removeBackground`: boolean (optional, default: true)
- `optimize`: boolean (optional, default: true)

**Response:**
```json
{
  "url": "https://res.cloudinary.com/.../processed-image.png",
  "format": "png",
  "processed": true,
  "originalFormat": "jpg",
  "size": 245760
}
```

## 🎨 UI Components

### ImageProcessorComponent
- **Inputs:**
  - `label`: string - Upload area label
  - `placeholder`: string - Upload area placeholder text
  - `control`: FormControl - Angular form control
  - `processingOptions`: ProcessingOptions - Processing settings

- **Outputs:**
  - `fileSelected`: File - When file is selected
  - `fileProcessed`: ProcessedImageResult - When processing completes
  - `processingError`: string - When processing fails

### ProcessingOptions Interface
```typescript
interface ProcessingOptions {
  removeBackground: boolean;  // Remove background using AI
  optimize: boolean;         // Optimize image size
}
```

### ProcessedImageResult Interface
```typescript
interface ProcessedImageResult {
  url: string;              // Cloudinary URL
  format: string;           // Output format (always 'png')
  processed: boolean;       // Processing success flag
  originalFormat: string;   // Original file format
  size: number;            // File size in bytes
}
```

## 🎯 Demo Page

Access the demo page at: `/admin/image-processor-demo`

Features:
- Real-time processing options
- Side-by-side comparison
- Processing history
- Error handling
- Responsive design

## 🔒 Security & Limits

- **File Size**: Maximum 10MB per image
- **Formats**: JPG, JPEG, PNG, WEBP
- **API Limits**: Remove.bg has rate limits (check their documentation)
- **Storage**: Images stored in Cloudinary with automatic cleanup

## 🐛 Troubleshooting

### Common Issues

1. **"Remove.bg API key not configured"**
   - Add `REMOVE_BG_API_KEY` to your `.env` file
   - Restart the backend server

2. **"File too large"**
   - Reduce image size before upload
   - Maximum file size is 10MB

3. **"Processing failed"**
   - Check Remove.bg API key validity
   - Verify internet connection
   - Check Cloudinary configuration

4. **"Unsupported format"**
   - Only JPG, PNG, WEBP formats are supported
   - Convert your image to a supported format

### Debug Mode
Enable debug logging in the backend:
```typescript
// In image-processing.service.ts
private readonly logger = new Logger(ImageProcessingService.name);
```

## 📱 Responsive Design

The component is fully responsive:
- **Desktop**: Side-by-side preview
- **Tablet**: Stacked preview with options
- **Mobile**: Single column layout

## 🎨 Theme Support

Supports both default and glass themes:
- **Default**: Clean Material Design
- **Glass**: Transparent glassmorphism effect

## 🔄 Future Enhancements

- [ ] Batch processing
- [ ] Custom background colors
- [ ] Image filters and effects
- [ ] Advanced optimization options
- [ ] Local processing (no API dependency)
- [ ] Progress indicators
- [ ] Drag & drop support

## 📄 License

This feature uses:
- **Remove.bg API**: For background removal
- **Sharp**: For image processing
- **Cloudinary**: For image storage 