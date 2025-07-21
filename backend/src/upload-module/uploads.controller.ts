import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { v4 as uuidv4 } from "uuid";
import { execSync } from "child_process";
import { unlinkSync, statSync } from "fs";
import * as os from "os";
import { v2 as cloudinary } from "cloudinary";
import "../config/cloudinary.config";
import { spawn } from 'child_process';

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
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return callback(
            new BadRequestException("Only image files are allowed!"),
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
}  