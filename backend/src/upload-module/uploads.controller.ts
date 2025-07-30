import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Body,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { v4 as uuidv4 } from "uuid";
import { execSync } from "child_process";
import { unlinkSync, statSync, readFileSync } from "fs";
import * as os from "os";
import { v2 as cloudinary } from "cloudinary";
import "../config/cloudinary.config";
import { spawn } from 'child_process';
import { ImageProcessingService } from '../services/image-processing.service';

function optimizeGLB(inputPath: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn('npx', [
      'gltf-transform', 'optimize',
      inputPath, outputPath,
      '--weld', '--simplify', '--prune', '--texture-compress', 'webp'
    ], { stdio: 'inherit' });

    proc.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error('gltf-transform failed with code ' + code));
    });
    proc.on('error', reject);
  });
}

@Controller("uploads")
export class UploadsController {
  constructor(private readonly imageProcessingService: ImageProcessingService) {}
  @Post("sections")
  @UseInterceptors(
    FileInterceptor("image", {
      storage: diskStorage({
        destination: os.tmpdir(),
        filename: (req, file, callback) => {
          const uniqueSuffix = uuidv4();
          callback(null, `section-${uniqueSuffix}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|svg\+xml)$/)) {
          return callback(
            new BadRequestException("Only image files (JPG, PNG, GIF, SVG) are allowed!"),
            false
          );
        }
        callback(null, true);
      },
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
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'sections',
        use_filename: true,
        unique_filename: false,
        overwrite: true,
      });
      unlinkSync(file.path);
      return { url: result.secure_url };
    } catch (e) {
      throw new BadRequestException('Cloudinary image upload failed');
    }
  }

  @Post("sections-3d")
  @UseInterceptors(
    FileInterceptor("model", {
      storage: diskStorage({
        destination: os.tmpdir(),
        filename: (req, file, callback) => {
          const uniqueSuffix = uuidv4();
          callback(null, `section3d-upload-${uniqueSuffix}.glb`);
        },
      }),
      fileFilter: (req, file, callback) => {
        const isGlb = file.originalname.toLowerCase().endsWith('.glb');
        if (!isGlb) {
          console.error("File rejected: not a .glb", file.originalname);
          return callback(
            new BadRequestException("Only .glb files are allowed!"),
            false
          );
        }
        callback(null, true);
      },
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB
      },
    })
  )
  async uploadSection3dModel(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException("No file uploaded");

    const inputPath = file.path;
    const outputPath = inputPath.replace(".glb", "-optimized.glb");

    try {
      console.log("Optimizing 3D model...");
      await optimizeGLB(inputPath, outputPath);
      const { size } = statSync(outputPath);
      if (size > 10 * 1024 * 1024) {
        throw new BadRequestException(
          `Optimized file is too large: ${(size / 1024 / 1024).toFixed(2)}MB`
        );
      }
      const result = await cloudinary.uploader.upload(outputPath, {
        resource_type: "raw",
        folder: "sections-3d",
        use_filename: true,
        unique_filename: false,
        overwrite: true,
      });
      unlinkSync(inputPath);
      unlinkSync(outputPath);
      return { url: result.secure_url };
    } catch (e) {
      console.error("Error during optimization or upload:", e);
      throw new BadRequestException("3D model optimization or upload failed");
    }
  }

  @Post("products-3d")
  @UseInterceptors(
    FileInterceptor("model", {
      storage: diskStorage({
        destination: os.tmpdir(),
        filename: (req, file, callback) => {
          const uniqueSuffix = uuidv4();
          callback(null, `product3d-upload-${uniqueSuffix}.glb`);
        },
      }),
      fileFilter: (req, file, callback) => {
        const isGlb = file.originalname.toLowerCase().endsWith('.glb');
        if (!isGlb) {
          return callback(
            new BadRequestException("Only .glb files are allowed!"),
            false
          );
        }
        callback(null, true);
      },
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB
      },
    })
  )
  async uploadProduct3dModel(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException("No file uploaded");
    const inputPath = file.path;
    const outputPath = inputPath.replace(".glb", "-optimized.glb");
    try {
      await optimizeGLB(inputPath, outputPath);
      const { size } = statSync(outputPath);
      if (size > 10 * 1024 * 1024) {
        throw new BadRequestException(
          `Optimized file is too large: ${(size / 1024 / 1024).toFixed(2)}MB`
        );
      }
      const result = await cloudinary.uploader.upload(outputPath, {
        resource_type: "raw",
        folder: "products-3d",
        use_filename: true,
        unique_filename: false,
        overwrite: true,
      });
      unlinkSync(inputPath);
      unlinkSync(outputPath);
      return { url: result.secure_url };
    } catch (e) {
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
      fileFilter: (req, file, callback) => {
        if (!file.originalname || !this.imageProcessingService.validateImageFormat(file.originalname)) {
          return callback(
            new BadRequestException("Only image files (JPG, PNG, WEBP) are allowed!"),
            false
          );
        }
        callback(null, true);
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    })
  )
  async processImageWithBackgroundRemoval(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { removeBackground?: boolean; optimize?: boolean }
  ) {
    if (!file) {
      throw new BadRequestException("No file uploaded");
    }

    try {
      const imageBuffer = readFileSync(file.path);
      
      let processedBuffer: Buffer;
      
      const removeBackground = body.removeBackground === 'true' || body.removeBackground === true;
      const optimize = body.optimize === 'true' || body.optimize === true;
      
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
          console.error('Failed to delete temp file:', unlinkError);
        }
      }
      
      let errorMessage = 'Image processing failed';
      if (error.message) {
        errorMessage = error.message;
      }
      
      console.error('Image processing error:', error);
      throw new BadRequestException(errorMessage);
    }
  }
}  