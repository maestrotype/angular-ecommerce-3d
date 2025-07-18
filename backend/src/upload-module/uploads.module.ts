import { Module } from '@nestjs/common';
import { UploadsController } from './uploads.controller';
import { ThreeDUploadModule } from './three-d-upload.module';


@Module({
  imports: [ThreeDUploadModule],
  controllers: [UploadsController],
})
export class UploadsModule {}