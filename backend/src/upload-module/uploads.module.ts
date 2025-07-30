import { Module } from '@nestjs/common';
import { UploadsController } from './uploads.controller';
import { ImageProcessingService } from '../services/image-processing.service';

@Module({
  controllers: [UploadsController],
  providers: [ImageProcessingService],
})
export class UploadsModule {}