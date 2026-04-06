import { Controller, Post, Get, Body, Param, Logger } from '@nestjs/common';
import { Tripo3dService } from './tripo3d.service';

@Controller('tripo-api')
export class Tripo3dController {
  private readonly logger = new Logger(Tripo3dController.name);

  constructor(private readonly tripoService: Tripo3dService) {}

  @Post('generate')
  async generate(@Body('imageUrl') imageUrl: string) {
    this.logger.log(`Received generation request for ${imageUrl}`);
    return this.tripoService.generateTask(imageUrl);
  }

  @Get('status/:taskId')
  async getStatus(@Param('taskId') taskId: string) {
    return this.tripoService.getTaskStatus(taskId);
  }

  @Get('history')
  async getHistory() {
    return this.tripoService.listTasks();
  }
}
