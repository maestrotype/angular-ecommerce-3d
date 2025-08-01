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

// GLB optimization function
async function optimizeGLB(inputPath: string, outputPath: string): Promise<void> {
  // Implementation for GLB optimization
  // This would typically use gltf-transform or similar library
  console.log(`Optimizing GLB from ${inputPath} to ${outputPath}`);
}

@Controller("uploads")
export class UploadsController {
  constructor(private readonly imageProcessingService: ImageProcessingService) {}

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
  async uploadSectionImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException("No file uploaded");
    }

    try {
      const uploadPromise = new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "section-images",
            resource_type: "image",
          },
          (error, result) => {
            if (error) {
              reject(new BadRequestException("Cloudinary upload failed"));
            } else {
              resolve(result);
            }
          }
        );
        uploadStream.end(readFileSync(file.path));
      });

      const result = await uploadPromise as any;
      unlinkSync(file.path);

      return {
        url: result.secure_url,
        publicId: result.public_id,
      };
    } catch (error) {
      if (file.path) {
        try {
          unlinkSync(file.path);
        } catch (unlinkError) {
          console.error("Failed to delete temp file:", unlinkError);
        }
      }
      throw new BadRequestException("Section image upload failed");
    }
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
  async uploadSection3dModel(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException("No file uploaded");
    }

    try {
      const uploadPromise = new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "section-3d-models",
            resource_type: "raw",
          },
          (error, result) => {
            if (error) {
              reject(new BadRequestException("Cloudinary upload failed"));
            } else {
              resolve(result);
            }
          }
        );
        uploadStream.end(readFileSync(file.path));
      });

      const result = await uploadPromise as any;
      unlinkSync(file.path);

      return {
        url: result.secure_url,
        publicId: result.public_id,
      };
    } catch (error) {
      if (file.path) {
        try {
          unlinkSync(file.path);
        } catch (unlinkError) {
          console.error("Failed to delete temp file:", unlinkError);
        }
      }
      throw new BadRequestException("3D model upload failed");
    }
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
  async uploadProduct3dModel(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException("No file uploaded");
    }

    try {
      const uploadPromise = new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "product-3d-models",
            resource_type: "raw",
          },
          (error, result) => {
            if (error) {
              reject(new BadRequestException("Cloudinary upload failed"));
            } else {
              resolve(result);
            }
          }
        );
        uploadStream.end(readFileSync(file.path));
      });

      const result = await uploadPromise as any;
      unlinkSync(file.path);

      return {
        url: result.secure_url,
        publicId: result.public_id,
      };
    } catch (error) {
      if (file.path) {
        try {
          unlinkSync(file.path);
        } catch (unlinkError) {
          console.error("Failed to delete temp file:", unlinkError);
        }
      }
      throw new BadRequestException("3D model optimization or upload failed");
    }
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
  async processImageWithBackgroundRemoval(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { removeBackground?: any; optimize?: any }
  ) {
    if (!file) {
      throw new BadRequestException("No file uploaded");
    }

    if (!file.originalname || !this.imageProcessingService?.validateImageFormat(file.originalname)) {
      throw new BadRequestException("Only image files (JPG, PNG, WEBP) are allowed!");
    }

    try {
      const imageBuffer = readFileSync(file.path);
      let processedBuffer: Buffer;
      
      const removeBackground = body.removeBackground === 'true' || body.removeBackground === true || body.removeBackground === '1';
      const optimize = body.optimize === 'true' || body.optimize === true || body.optimize === '1';
      
      if (removeBackground) {
        processedBuffer = await this.imageProcessingService.processImageWithBackgroundRemoval(
          imageBuffer,
          file.originalname.split('.').pop() || 'jpg'
        );
      } else {
        processedBuffer = await this.imageProcessingService.convertToPng(imageBuffer);
      }

      if (optimize) {
        processedBuffer = await this.imageProcessingService.optimizeImage(processedBuffer);
      }

      const uploadPromise = new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'processed-images',
            format: 'png',
            resource_type: 'image',
          },
          (error, result) => {
            if (error) {
              reject(new BadRequestException('Cloudinary upload failed'));
            } else {
              resolve(result);
            }
          }
        );
        uploadStream.end(processedBuffer);
      });

      const result = await uploadPromise as any;
      unlinkSync(file.path);
      
      return {
        url: result.secure_url,
        format: 'png',
        processed: true,
        originalFormat: file.originalname.split('.').pop() || 'unknown',
        size: processedBuffer.length
      };
    } catch (error) {
      if (file.path) {
        try {
          unlinkSync(file.path);
        } catch (unlinkError) {
          // Ignore cleanup errors
        }
      }
      throw new BadRequestException(error.message || 'Image processing failed');
    }
  }
}  