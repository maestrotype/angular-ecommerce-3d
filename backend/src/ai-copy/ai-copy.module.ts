import { Module } from '@nestjs/common';
import { SettingsModule } from '../settings/settings.module';
import { AiCopyController } from './ai-copy.controller';
import { AiCopyService } from './ai-copy.service';

@Module({
  imports: [SettingsModule],
  controllers: [AiCopyController],
  providers: [AiCopyService],
})
export class AiCopyModule {}
