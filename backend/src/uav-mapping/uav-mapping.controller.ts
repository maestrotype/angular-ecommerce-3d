import { 
  Controller, 
  Post, 
  Get, 
  Param, 
  Body, 
  UseInterceptors, 
  UploadedFiles, 
  Logger 
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { UavMappingBackendService } from './uav-mapping.service';

@Controller('uav-mapping')
export class UavMappingController {
  private readonly logger = new Logger(UavMappingController.name);

  constructor(private readonly uavService: UavMappingBackendService) {}

  /**
   * Эндпоинт для загрузки видео и запуска SOTA-обработки.
   * Endpoint for video upload and SOTA processing start.
   */
  @Post('process')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'video', maxCount: 1 },
    { name: 'images', maxCount: 10 },
  ], {
    storage: diskStorage({
      destination: join(process.cwd(), 'uploads'),
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        return cb(null, `${randomName}${extname(file.originalname)}`);
      }
    }),
    limits: { fileSize: 500 * 1024 * 1024 } // 500MB
  }))
  async processVideo(
    @UploadedFiles() files: { video?: Express.Multer.File[], images?: Express.Multer.File[] },
    @Body('polygon') polygon: string,
    @Body('hints') hints: string,
  ) {
    if (!files.video || files.video.length === 0) {
      throw new Error('Video file is required');
    }

    const safeHints = hints || '';
    this.logger.log(`Received mapping request. Hints: ${safeHints.substring(0, 50)}...`);
    
    return this.uavService.startMapping(
      files.video[0],
      polygon,
      hints,
      files.images || []
    );
  }

  @Get('status/:taskId')
  async getTaskStatus(@Param('taskId') taskId: string) {
    return this.uavService.getTaskStatus(taskId);
  }

  @Post('stop/:taskId')
  async stopTask(@Param('taskId') taskId: string) {
    this.logger.log(`Received request to stop task ${taskId}`);
    return this.uavService.stopTask(taskId);
  }
}
