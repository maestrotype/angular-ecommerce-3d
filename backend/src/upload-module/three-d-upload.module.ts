import { Module } from '@nestjs/common';
import { ThreeDUploadController } from './three-d-upload.controller';

@Module({
  controllers: [ThreeDUploadController],
})
export class ThreeDUploadModule {}