import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Body,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { v4 as uuidv4 } from "uuid";
import { readFileSync, unlinkSync } from "fs";
import * as os from "os";
import { v2 as cloudinary } from "cloudinary";
import { ImageProcessingService } from "../services/image-processing.service";
import { Observable, from, throwError, bindNodeCallback, of } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';

// GLB optimization function
function optimizeGLB(inputPath: string, outputPath: string): Observable<void> {
  // Implementation for GLB optimization
  // This would typically use gltf-transform or similar library
  console.log(`Optimizing GLB from ${inputPath} to ${outputPath}`);
  return of(void 0);
}

// Helper function to create Cloudinary upload observable
function createCloudinaryUpload(folder: string, resourceType: "image" | "raw" | "video" | "auto", buffer: Buffer): Observable<any> {
  return new Observable(observer => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
      },
      (error, result) => {
        if (error) {
          observer.error(new BadRequestException("Cloudinary upload failed"));
        } else {
          observer.next(result);
          observer.complete();
        }
      }
    );
    uploadStream.end(buffer);
  });
}

@Controller("uploads")
export class UploadsController {
  constructor(private readonly imageProcessingService: ImageProcessingService) { }

  @Post("section-image")
  @UseInterceptors(
    FileInterceptor("image", {
      storage: diskStorage({
        destination: os.tmpdir(),
        filename: (req, file, callback) => {
          const uniqueSuffix = uuidv4();
          callback(null, `section-${uniqueSuffix}`);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    })
  )
  uploadSectionImage(@UploadedFile() file: Express.Multer.File): Observable<{ url: string; publicId: string }> {
    if (!file) {
      return throwError(() => new BadRequestException("No file uploaded"));
    }

    const imageBuffer = readFileSync(file.path);

    return createCloudinaryUpload("section-images", "image", imageBuffer).pipe(
      map((result: any) => {
        unlinkSync(file.path);
        return {
          url: result.secure_url,
          publicId: result.public_id,
        };
      }),
      catchError(error => {
        if (file.path) {
          try {
            unlinkSync(file.path);
          } catch (unlinkError) {
            console.error("Failed to delete temp file:", unlinkError);
          }
        }
        return throwError(() => new BadRequestException("Section image upload failed"));
      })
    );
  }

  @Post("section-3d-model")
  @UseInterceptors(
    FileInterceptor("model", {
      storage: diskStorage({
        destination: os.tmpdir(),
        filename: (req, file, callback) => {
          const uniqueSuffix = uuidv4();
          callback(null, `section-3d-${uniqueSuffix}`);
        },
      }),
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB
      },
    })
  )
  uploadSection3dModel(@UploadedFile() file: Express.Multer.File): Observable<{ url: string; publicId: string }> {
    if (!file) {
      return throwError(() => new BadRequestException("No file uploaded"));
    }

    const modelBuffer = readFileSync(file.path);

    return createCloudinaryUpload("section-3d-models", "raw", modelBuffer).pipe(
      map((result: any) => {
        unlinkSync(file.path);
        return {
          url: result.secure_url,
          publicId: result.public_id,
        };
      }),
      catchError(error => {
        if (file.path) {
          try {
            unlinkSync(file.path);
          } catch (unlinkError) {
            console.error("Failed to delete temp file:", unlinkError);
          }
        }
        return throwError(() => new BadRequestException("3D model upload failed"));
      })
    );
  }

  @Post("product-3d-model")
  @UseInterceptors(
    FileInterceptor("model", {
      storage: diskStorage({
        destination: os.tmpdir(),
        filename: (req, file, callback) => {
          const uniqueSuffix = uuidv4();
          callback(null, `product-3d-${uniqueSuffix}`);
        },
      }),
      limits: {
        fileSize: 100 * 1024 * 1024, // 100MB
      },
    })
  )
  uploadProduct3dModel(@UploadedFile() file: Express.Multer.File): Observable<{ url: string; publicId: string }> {
    if (!file) {
      return throwError(() => new BadRequestException("No file uploaded"));
    }

    const modelBuffer = readFileSync(file.path);

    return createCloudinaryUpload("product-3d-models", "raw", modelBuffer).pipe(
      map((result: any) => {
        unlinkSync(file.path);
        return {
          url: result.secure_url,
          publicId: result.public_id,
        };
      }),
      catchError(error => {
        if (file.path) {
          try {
            unlinkSync(file.path);
          } catch (unlinkError) {
            console.error("Failed to delete temp file:", unlinkError);
          }
        }
        return throwError(() => new BadRequestException("3D model optimization or upload failed"));
      })
    );
  }

  @Post("process-image")
  @UseInterceptors(
    FileInterceptor("image", {
      storage: diskStorage({
        destination: os.tmpdir(),
        filename: (req, file, callback) => {
          const uniqueSuffix = uuidv4();
          callback(null, `processed-${uniqueSuffix}`);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    })
  )
  processImageWithBackgroundRemoval(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { removeBackground?: any; optimize?: any }
  ): Observable<{ url: string; format: string; processed: boolean; originalFormat: string; size: number }> {
    if (!file) {
      return throwError(() => new BadRequestException("No file uploaded"));
    }

    if (!file.originalname || !this.imageProcessingService?.validateImageFormat(file.originalname)) {
      return throwError(() => new BadRequestException("Only image files (JPG, PNG, WEBP, SVG) are allowed!"));
    }

    const format = file.originalname.split('.').pop()?.toLowerCase() || 'jpg';
    const imageBuffer = readFileSync(file.path);
    const removeBackground = body.removeBackground === 'true' || body.removeBackground === true || body.removeBackground === '1';
    const optimize = body.optimize === 'true' || body.optimize === true || body.optimize === '1';

    console.log(`[UploadsController] Processing request: file=${file.originalname}, format=${format}, size=${file.size}, removeBackground=${removeBackground}, optimize=${optimize}`);

    // Skip processing for SVG as it's vector
    if (format === 'svg') {
      console.log(`[UploadsController] Skipping processing for SVG file: ${file.originalname}`);
      return createCloudinaryUpload('processed-images', 'image', imageBuffer).pipe(
        map((result: any) => {
          unlinkSync(file.path); // Clean up temp file
          return {
            url: result.secure_url,
            format: result.format,
            processed: false, // Indicate no processing was done
            originalFormat: format,
            size: file.size
          };
        }),
        catchError(error => {
          if (file.path) {
            try {
              unlinkSync(file.path);
            } catch (unlinkError) {
              console.error("Failed to delete temp file:", unlinkError);
            }
          }
          return throwError(() => new BadRequestException("SVG upload failed"));
        })
      );
    }

    let processObservable: Observable<Buffer>;

    if (removeBackground) {
      console.log(`[UploadsController] Starting background removal for ${file.originalname}`);
      processObservable = this.imageProcessingService.processImageWithBackgroundRemoval(
        imageBuffer,
        format
      );
    } else {
      console.log(`[UploadsController] Starting only PNG conversion for ${file.originalname}`);
      processObservable = this.imageProcessingService.convertToPng(imageBuffer);
    }

    if (optimize) {
      processObservable = processObservable.pipe(
        tap(() => console.log(`[UploadsController] Starting optimization for ${file.originalname}`)),
        switchMap(processedBuffer => this.imageProcessingService.optimizeImage(processedBuffer))
      );
    }

    return processObservable.pipe(
      tap(() => console.log(`[UploadsController] Image processed successfully, uploading to Cloudinary...`)),
      switchMap(processedBuffer => {
        return createCloudinaryUpload('processed-images', 'image', processedBuffer).pipe(
          map((result: any) => {
            unlinkSync(file.path);
            return {
              url: result.secure_url,
              format: 'png',
              processed: true,
              originalFormat: file.originalname.split('.').pop() || 'unknown',
              size: processedBuffer.length
            };
          })
        );
      }),
      catchError(error => {
        if (file.path) {
          try {
            unlinkSync(file.path);
          } catch (unlinkError) {
            // Ignore cleanup errors
          }
        }
        return throwError(() => new BadRequestException(error.message || 'Image processing failed'));
      })
    );
  }
}  