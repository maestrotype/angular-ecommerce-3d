import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { UavMappingController } from './uav-mapping.controller';
import { UavMappingBackendService } from './uav-mapping.service';

@Module({
  imports: [HttpModule],
  controllers: [UavMappingController],
  providers: [UavMappingBackendService],
  exports: [UavMappingBackendService]
})
export class UavMappingModule {}
