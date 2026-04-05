import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { Tripo3DService } from './tripo3d.service';
import { Tripo3DController } from './tripo3d.controller';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [
    HttpModule,
    SettingsModule,
  ],
  controllers: [Tripo3DController],
  providers: [Tripo3DService],
  exports: [Tripo3DService],
})
export class Tripo3DModule {}


