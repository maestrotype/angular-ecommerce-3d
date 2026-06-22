import { Module } from '@nestjs/common';
import { UploadsController } from './uploads.controller';
import { ImageProcessingService } from '../services/image-processing.service';
import { GlbOptimizationService } from '../services/glb-optimization.service';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [SettingsModule],
  controllers: [UploadsController],
  providers: [ImageProcessingService, GlbOptimizationService],
})
export class UploadsModule {}