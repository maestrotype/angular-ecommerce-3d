import {
  Controller,
  Post,
  Get,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Body,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { v4 as uuidv4 } from "uuid";
import { readFileSync, unlinkSync, existsSync } from "fs";
import * as os from "os";
import { join } from "path";
import { v2 as cloudinary } from "cloudinary";
import { ImageProcessingService } from "../services/image-processing.service";
import { GlbOptimizationService, CLOUDINARY_RAW_FILE_LIMIT, RAW_GLB_UPLOAD_MAX_BYTES, MAX_STORED_GLB_BYTES } from "../services/glb-optimization.service";
import { saveModelToLocalDisk, isCloudinarySizeError } from "../services/model-storage.util";
import { CloudinaryConfigService } from "../services/cloudinary-config.service";
import { Observable, from, throwError } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';


// Helper function to create Cloudinary upload observable
function createCloudinaryUpload(folder: string, resourceType: "image" | "raw" | "video" | "auto", buffer: Buffer): Observable<any> {
  return new Observable(observer => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        chunk_size: 6000000, // 6MB chunks to support large files > 10MB
        timeout: 600000, // 10 minutes timeout for large files on slow connections
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error details:", error);
          observer.error(new BadRequestException(`Cloudinary upload failed: ${error.message || JSON.stringify(error)}`));
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
  constructor(
    private readonly imageProcessingService: ImageProcessingService,
    private readonly glbOptimizationService: GlbOptimizationService,
    private readonly cloudinaryConfigService: CloudinaryConfigService,
  ) { }

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

  @Post("section-video")
  @UseInterceptors(
    FileInterceptor("video", {
      storage: diskStorage({
        destination: os.tmpdir(),
        filename: (req, file, callback) => {
          const uniqueSuffix = uuidv4();
          callback(null, `section-video-${uniqueSuffix}`);
        },
      }),
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB
      },
    })
  )
  uploadSectionVideo(@UploadedFile() file: Express.Multer.File): Observable<{ url: string; publicId: string }> {
    if (!file) {
      return throwError(() => new BadRequestException("No file uploaded"));
    }

    const allowed = ["video/mp4", "video/webm", "video/quicktime"];
    if (!allowed.includes(file.mimetype)) {
      try {
        unlinkSync(file.path);
      } catch (unlinkError) {
        console.error("Failed to delete temp file:", unlinkError);
      }
      return throwError(() => new BadRequestException("Only MP4, WebM, and MOV video files are allowed"));
    }

    const videoBuffer = readFileSync(file.path);

    return createCloudinaryUpload("section-videos", "video", videoBuffer).pipe(
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
        return throwError(() => new BadRequestException("Section video upload failed"));
      })
    );
  }

  private cleanupTempFiles(filePath: string, optimizedPath: string | null): void {
    try { unlinkSync(filePath); } catch (e) {}
    if (optimizedPath) {
      try { unlinkSync(optimizedPath); } catch (e) {}
    }
  }

  private async uploadGlbToCloudinary(
    uploadPath: string,
    folder: string,
    publicId?: string,
  ): Promise<{ url: string; publicId: string }> {
    // Cloudinary SDK timeout + outer promise timeout to prevent hanging forever
    const CLOUDINARY_UPLOAD_TIMEOUT = 60_000; // 60 seconds

    const result = await new Promise<any>((resolve, reject) => {
      // Outer timeout to catch cases where Cloudinary SDK doesn't fire the callback
      const timer = setTimeout(() => {
        reject(new Error(`Cloudinary upload timeout after ${CLOUDINARY_UPLOAD_TIMEOUT / 1000}s`));
      }, CLOUDINARY_UPLOAD_TIMEOUT);

      cloudinary.uploader.upload_large(uploadPath, {
        folder,
        resource_type: "raw",
        public_id: publicId,
        chunk_size: 6000000,
        timeout: 600000,
      }, (error, uploadResult) => {
        clearTimeout(timer);
        if (error) reject(error);
        else resolve(uploadResult);
      });
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  }

  private async processAndUpload3dModel(
    file: Express.Multer.File,
    folder: string,
    isProduct: boolean
  ): Promise<{ url: string; publicId: string; localPath?: string }> {
    if (!file) {
      throw new BadRequestException("No file uploaded");
    }

    const isProduction = process.env.NODE_ENV?.toLowerCase() === 'production' || process.env.RENDER === 'true';
    const isCloudinaryConfigured = this.cloudinaryConfigService.isConfigured();
    // In development mode, ALWAYS use local storage.
    // Only use Cloudinary in production.
    const useCloudinary = isProduction;

    if (isProduction && !isCloudinaryConfigured) {
      throw new BadRequestException(
        'CLOUDINARY_NOT_CONFIGURED: Set Cloudinary credentials in Admin → Integrations or as CLOUDINARY_* environment variables on Render.',
      );
    }

    if (!isProduction) {
      console.log('[UploadsController] Dev mode detected — using local storage for 3D models');
    }

    let uploadPath = file.path;
    let optimizedPath: string | null = null;
    try {
      optimizedPath = await this.glbOptimizationService.optimize(file.path);
      if (optimizedPath) {
        uploadPath = optimizedPath;
      }
    } catch (e) {
      console.error("[UploadsController] Uncaught error during optimization step:", e);
    }

    const finalSize = existsSync(uploadPath) ? readFileSync(uploadPath).length : file.size;
    console.log(`[UploadsController] 3D model ready for storage. Size: ${(finalSize / 1024 / 1024).toFixed(2)}MB`);

    if (finalSize > MAX_STORED_GLB_BYTES) {
      this.cleanupTempFiles(file.path, optimizedPath);
      throw new BadRequestException(
        'Model exceeds 50MB limit after optimization. Reduce textures or mesh complexity in Blender.',
      );
    }

    const isAi = file.originalname.toLowerCase().includes('ai-gen') || file.originalname.toLowerCase().includes('task_');
    const publicId = (isProduct && isAi) ? `ai-gen-${uuidv4()}` : undefined;

    // Try Cloudinary first if configured and file is within size limits.
    // On failure, fall back to local storage (unless in production).
    let cloudinaryError: any = null;
    if (useCloudinary && finalSize <= CLOUDINARY_RAW_FILE_LIMIT) {
      console.log(`[UploadsController] Uploading 3D model to Cloudinary (${folder})...`);
      try {
        const cloudResult = await this.uploadGlbToCloudinary(uploadPath, folder, publicId);
        this.cleanupTempFiles(file.path, optimizedPath);
        return cloudResult;
      } catch (error: any) {
        console.error(`[UploadsController] Cloudinary upload failed, falling back to local:`, error);
        cloudinaryError = error;
      }
    }

    // In production, if Cloudinary was attempted and failed, throw an error.
    if (isProduction && cloudinaryError) {
      this.cleanupTempFiles(file.path, optimizedPath);
      if (isCloudinarySizeError(cloudinaryError)) {
        throw new BadRequestException(
          'Model exceeds Cloudinary 10MB limit after optimization. Reduce textures or mesh complexity in Blender.',
        );
      }
      const message = cloudinaryError?.message || "3D model Cloudinary upload failed";
      throw new BadRequestException(`Cloudinary upload failed: ${message}`);
    }

    // In production, if file exceeds Cloudinary limit, throw an error.
    if (useCloudinary && isProduction && !cloudinaryError) {
      this.cleanupTempFiles(file.path, optimizedPath);
      throw new BadRequestException(
        'Model exceeds Cloudinary 10MB limit after optimization. Reduce textures or mesh complexity in Blender.',
      );
    }

    // Fall back to local storage.
    console.log(`[UploadsController] Saving 3D model to local storage...`);
    const localResult = saveModelToLocalDisk(uploadPath, isProduct, file.originalname);
    this.cleanupTempFiles(file.path, optimizedPath);
    return localResult;
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
        fileSize: RAW_GLB_UPLOAD_MAX_BYTES,
      },
    })
  )
  uploadSection3dModel(@UploadedFile() file: Express.Multer.File): Observable<{ url: string; publicId: string; localPath?: string }> {
    return from(this.processAndUpload3dModel(file, "section-3d-models", false));
  }

  @Get("cloudinary-status")
  getCloudinaryStatus(): Observable<any> {
    return from(this.cloudinaryConfigService.getStatus()).pipe(
      map((status) => ({ success: true, data: status })),
    );
  }

  @Post("product-3d-model")
  @UseInterceptors(
    FileInterceptor("model", {
      storage: diskStorage({
        destination: os.tmpdir(),
        filename: (req, file, callback) => {
          const uniqueSuffix = uuidv4();
          const isAi = file.originalname.toLowerCase().includes('ai-gen') || file.originalname.toLowerCase().includes('task_');
          const prefix = isAi ? 'ai-gen-' : 'product-3d-';
          callback(null, `${prefix}${uniqueSuffix}`);
        },
      }),
      limits: {
        fileSize: RAW_GLB_UPLOAD_MAX_BYTES,
      },
    })
  )
  uploadProduct3dModel(@UploadedFile() file: Express.Multer.File): Observable<{ url: string; publicId: string; localPath?: string }> {
    return from(this.processAndUpload3dModel(file, "product-3d-models", true));
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

  @Post("archive-local")
  archiveLocalFile(@Body() body: { path: string; folder?: string }): Observable<{ url: string; publicId: string }> {
    if (!body.path) {
      return throwError(() => new BadRequestException("No path provided"));
    }

    // Path should be like 'LOCAL:/uploads/products-3d/file.glb' or an absolute path
    let cleanPath = body.path.replace('LOCAL:', '');
    
    // If it's a relative URL path (starts with /uploads), resolve it to absolute filesystem path
    if (cleanPath.startsWith('/uploads/')) {
      cleanPath = join(__dirname, '..', '..', cleanPath.substring(1));
    }
    
    if (!existsSync(cleanPath)) {
      console.error(`[UploadsController] Archive failed: File not found at ${cleanPath}`);
      return throwError(() => new BadRequestException(`Local file not found: ${cleanPath}`));
    }

    const folder = body.folder || "product-3d-models";

    const archivePromise = (async () => {
      let uploadPath = cleanPath;
      let optimizedPath: string | null = null;

      if (cleanPath.toLowerCase().endsWith('.glb')) {
        try {
          optimizedPath = await this.glbOptimizationService.optimize(cleanPath);
          if (optimizedPath) {
            uploadPath = optimizedPath;
          }
        } catch (e) {
          console.error("[UploadsController] Optimization failed during archiving:", e);
        }
      }

      const finalSize = existsSync(uploadPath) ? readFileSync(uploadPath).length : 0;
      const isAi = cleanPath.toLowerCase().includes('ai-gen') || cleanPath.toLowerCase().includes('task_');
      const publicId = isAi ? `ai-gen-${uuidv4()}` : undefined;

      if (finalSize <= CLOUDINARY_RAW_FILE_LIMIT) {
        try {
          const result = await this.uploadGlbToCloudinary(uploadPath, folder, publicId);
          if (optimizedPath) {
            try { unlinkSync(optimizedPath); } catch (e) {}
          }
          console.log(`[UploadsController] File successfully archived to Cloudinary: ${result.url}`);
          return result;
        } catch (error: any) {
          if (!isCloudinarySizeError(error)) {
            if (optimizedPath) {
              try { unlinkSync(optimizedPath); } catch (e) {}
            }
            console.error(`[UploadsController] Archive failed:`, error);
            throw new BadRequestException(error?.message || "Cloudinary archiving failed");
          }
          console.warn(`[UploadsController] Archive hit Cloudinary size limit after optimization`);
        }
      }

      if (optimizedPath) {
        try { unlinkSync(optimizedPath); } catch (e) {}
      }
      throw new BadRequestException(
        'Model is still larger than 10MB after optimization. Reduce texture resolution or mesh complexity in Blender, then try again.',
      );
    })();

    return from(archivePromise);
  }
}