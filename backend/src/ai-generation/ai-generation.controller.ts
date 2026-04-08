import { Controller, Post, Get, Body, Param, Logger, HttpCode, HttpStatus } from '@nestjs/common';
import { AiGenerationService } from './ai-generation.service';

@Controller('ai-generation')
export class AiGenerationController {
  private readonly logger = new Logger(AiGenerationController.name);

  constructor(private readonly aiService: AiGenerationService) {}

  @Post('generate')
  @HttpCode(HttpStatus.OK)
  async generate(@Body('imageUrl') imageUrl: string) {
    this.logger.log(`Received generation request for ${imageUrl}`);
    return this.aiService.generateTask(imageUrl);
  }

  @Get('status/:taskId')
  async getStatus(@Param('taskId') taskId: string) {
    return this.aiService.getTaskStatus(taskId);
  }

  @Get('history')
  async getHistory() {
    return this.aiService.listTasks();
  }

  @Post('download')
  async download(@Body('url') url: string, @Body('filename') filename: string) {
    return this.aiService.downloadModel(url, filename);
  }
}
