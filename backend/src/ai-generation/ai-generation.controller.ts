import { Controller, Post, Get, Put, Body, Param, Logger, HttpCode, HttpStatus } from '@nestjs/common';
import { AiGenerationService } from './ai-generation.service';

@Controller('ai-generation')
export class AiGenerationController {
  private readonly logger = new Logger(AiGenerationController.name);

  constructor(private readonly aiService: AiGenerationService) {}

  @Get('providers')
  async listProviders() {
    return this.aiService.listProviders();
  }

  @Put('active-provider')
  async setActiveProvider(@Body('provider') provider: string) {
    this.logger.log(`Switching active AI provider to ${provider}`);
    return this.aiService.setActiveProvider(provider);
  }

  @Post('generate')
  @HttpCode(HttpStatus.OK)
  async generate(
    @Body('imageUrl') imageUrl: string,
    @Body('isHq') isHq?: boolean,
    @Body('provider') provider?: string,
  ) {
    this.logger.log(`Received generation request for ${imageUrl} (HQ: ${isHq}, provider: ${provider || 'active'})`);
    return this.aiService.generateTask(imageUrl, isHq, provider);
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
