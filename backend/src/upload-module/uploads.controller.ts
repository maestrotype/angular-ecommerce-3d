import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";
import { v4 as uuidv4 } from "uuid";

@Controller("uploads")
export class UploadsController {
  @Post("sections")
  @UseInterceptors(
    FileInterceptor("image", {
      storage: diskStorage({
        destination: "./uploads/sections",
        filename: (req, file, callback) => {
          const uniqueSuffix = uuidv4();
          const ext = extname(file.originalname);
          callback(null, `section-${uniqueSuffix}${ext}`);
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
  uploadSectionImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException("No file uploaded");
    }

    return {
      url: `/uploads/sections/${file.filename}`,
    };
  }

  @Post("sections-3d")
  @UseInterceptors(
    FileInterceptor("model", {
      storage: diskStorage({
        destination: "./uploads/sections-3d",
        filename: (req, file, callback) => {
          const uniqueSuffix = uuidv4();
          callback(null, `section3d-${uniqueSuffix}.glb`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\\.glb$/)) {
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
  uploadSection3dModel(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException("No file uploaded");
    }
    return {
      url: `/uploads/sections-3d/${file.filename}`,
    };
  }
}
