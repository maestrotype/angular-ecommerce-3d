import {
    Controller,
    Post,
    UploadedFile,
    UseInterceptors,
    BadRequestException,
    Body,
    Query,
  } from '@nestjs/common';
  import { FileInterceptor } from '@nestjs/platform-express';
  import { diskStorage } from 'multer';
  import { v4 as uuidv4 } from 'uuid';
  import { execSync } from 'child_process';
  import { unlinkSync, existsSync, mkdirSync } from 'fs';
  import { join } from 'path';
  
  @Controller('uploads/3d-model')
  export class ThreeDUploadController {
    @Post()
    @UseInterceptors(
      FileInterceptor('model', {
        storage: diskStorage({
          destination: (req, file, cb) => {
            const uploadPath = join(__dirname, '../../uploads/3d-models');
            if (!existsSync(uploadPath)) mkdirSync(uploadPath, { recursive: true });
            cb(null, uploadPath);
          },
          filename: (req, file, cb) => {
            const uniqueSuffix = uuidv4();
            cb(null, `model3d-${uniqueSuffix}.glb`);
          },
        }),
        fileFilter: (req, file, cb) => {
          if (!file.originalname.toLowerCase().endsWith('.glb')) {
            return cb(new BadRequestException('Only .glb files are allowed!'), false);
          }
          cb(null, true);
        },
        limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
      }),
    )
    async upload3dModel(
      @UploadedFile() file: Express.Multer.File,
      @Query('type') type: 'product' | 'section' = 'product'
    ) {
      if (!file) throw new BadRequestException('No file uploaded');
  
      try {
        const optimizedPath = file.path.replace('.glb', '-optimized.glb');
        execSync(`gltf-pipeline -i "${file.path}" -o "${optimizedPath}" -d`);
        unlinkSync(file.path);
        file.path = optimizedPath;
      } catch (e) {
      }
  
      const destDir = join(__dirname, '../../uploads', type === 'section' ? 'sections-3d' : 'products-3d');
      if (!existsSync(destDir)) mkdirSync(destDir, { recursive: true });
      const destPath = join(destDir, file.filename);
      require('fs').renameSync(file.path, destPath);

      const url = `/uploads/${type === 'section' ? 'sections-3d' : 'products-3d'}/${file.filename}`;
      return { url };
    }
  }