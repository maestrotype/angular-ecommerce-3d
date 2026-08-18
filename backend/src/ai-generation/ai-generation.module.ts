import { Module } from '@nestjs/common';
import { AiGenerationService } from './ai-generation.service';
import { AiGenerationController } from './ai-generation.controller';
import { SettingsModule } from '../settings/settings.module';
import { HttpModule } from '@nestjs/axios';

// Providers
import { Tripo3dProvider } from './providers/tripo3d.provider';
import { Hunyuan3dProvider } from './providers/hunyuan3d.provider';
import { MeshyProvider } from './providers/meshy.provider';
import { LumaAiProvider } from './providers/luma.provider';
import { CustomProvider } from './providers/custom.provider';
import { Unique3dProvider } from './providers/unique3d.provider';
import { HunyuanV2Provider } from './providers/hunyuan-v2.provider';
import { HuggingFaceProvider } from './providers/huggingface.provider';

import { GlbOptimizationService } from '../services/glb-optimization.service';

@Module({
  imports: [SettingsModule, HttpModule],
  providers: [
    AiGenerationService,
    GlbOptimizationService,
    Tripo3dProvider,
    Hunyuan3dProvider,
    MeshyProvider,
    LumaAiProvider,
    CustomProvider,
    Unique3dProvider,
    HunyuanV2Provider,
    HuggingFaceProvider,
  ],
  controllers: [AiGenerationController],
  exports: [AiGenerationService],
})
export class AiGenerationModule {}
