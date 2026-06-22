import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettingsController } from './settings.controller';
import { PublicSettingsController } from './public-settings.controller';
import { SettingsService } from './settings.service';
import { Settings } from './entities/settings.entity';
import { CloudinaryConfigService } from '../services/cloudinary-config.service';

@Module({
  imports: [TypeOrmModule.forFeature([Settings])],
  controllers: [SettingsController, PublicSettingsController],
  providers: [SettingsService, CloudinaryConfigService],
  exports: [SettingsService, CloudinaryConfigService],
})
export class SettingsModule {}
