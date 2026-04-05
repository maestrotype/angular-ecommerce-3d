import { Controller, Post, Get, Body, Param, UseGuards, HttpException, HttpStatus, Query, Logger } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { Tripo3DService } from './tripo3d.service';

console.log('DEBUG: tripo3d.controller.ts FILE LOADED');

@Controller('tripo-api')
export class Tripo3DController {

  private readonly logger = new Logger(Tripo3DController.name);

  constructor(private readonly tripo3dService: Tripo3DService) {
    console.log('Tripo3DController: INSTANTIATED');
  }

  @Get('health')
  async getStatus() {
    console.log('Tripo3DController: health checked');
    return { status: 'ok', message: 'Tripo3D AI Service is active' };
  }

  @Get('hello')
  hello() {
    console.log('Tripo3DController: hello called');
    return { message: 'Hello from Tripo-API' };
  }


  @Get('history')
  async listTasks(@Query('limit') limit?: number) {
    console.log('Tripo3DController: listTasks (history) called with limit:', limit);
    return this.tripo3dService.listTasks(limit || 10);
  }




  @Post('generate')

  async generate(@Body('imageUrl') imageUrl: string) {
    if (!imageUrl) {
      throw new HttpException('Image URL is required', HttpStatus.BAD_REQUEST);
    }
    return this.tripo3dService.generateModelFromImage(imageUrl);
  }



  @Get('status/:taskId')
  async getTaskStatus(@Param('taskId') taskId: string) {
    return this.tripo3dService.getTaskStatus(taskId);
  }

  @Post('download')
  async download(@Body('url') url: string, @Body('filename') filename: string) {
    if (!url || !filename) {
      throw new HttpException('URL and filename are required', HttpStatus.BAD_REQUEST);
    }
    const path = await this.tripo3dService.downloadModel(url, filename);
    return { success: true, path };
  }
}



