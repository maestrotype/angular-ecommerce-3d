import { Module } from '@nestjs/common';
import { AiGenerationService } from './ai-generation.service';
import { AiGenerationController } from './ai-generation.controller';
import { SettingsModule } from '../settings/settings.module';

// Providers
import { Tripo3dProvider } from './providers/tripo3d.provider';
import { Hunyuan3dProvider } from './providers/hunyuan3d.provider';
import { MeshyProvider } from './providers/meshy.provider';
import { LumaAiProvider } from './providers/luma.provider';
import { CustomProvider } from './providers/custom.provider';

@Module({
  imports: [SettingsModule],
  providers: [
    AiGenerationService,
    Tripo3dProvider,
    Hunyuan3dProvider,
    MeshyProvider,
    LumaAiProvider,
    CustomProvider
  ],
  controllers: [AiGenerationController],
  exports: [AiGenerationService],
})
export class AiGenerationModule {}
