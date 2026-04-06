import { Module } from '@nestjs/common';
import { Tripo3dService } from './tripo3d.service';
import { Tripo3dController } from './tripo3d.controller';

@Module({
  providers: [Tripo3dService],
  controllers: [Tripo3dController],
  exports: [Tripo3dService],
})
export class Tripo3dModule {}
