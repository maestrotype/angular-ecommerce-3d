import {
    Controller,
    Get,
    Post,
    Patch,
    Param,
    Query,
    Body,
  } from '@nestjs/common';
  import { NotificationsService } from './notifications.service';
  import { CreateNotificationDto } from './dto/create-notification.dto';
  
  @Controller('notifications')
  export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) {}
  
    @Post()
    create(@Body() createNotificationDto: CreateNotificationDto) {
      return this.notificationsService.create(createNotificationDto);
    }
  
    @Get()
    findAll(@Query('userId') userId?: string) {
      return this.notificationsService.findAll(userId ? +userId : undefined);
    }
  
    @Get('unread')
    findUnread(@Query('userId') userId?: string) {
      return this.notificationsService.findUnread(userId ? +userId : undefined);
    }
  
    @Get('unread/count')
    getUnreadCount(@Query('userId') userId?: string) {
      return this.notificationsService.getUnreadCount(userId ? +userId : undefined);
    }
  
    @Patch(':id/read')
    markAsRead(@Param('id') id: string) {
      return this.notificationsService.markAsRead(+id);
    }
  
    @Patch('read-all')
    markAllAsRead(@Query('userId') userId?: string) {
      return this.notificationsService.markAllAsRead(userId ? +userId : undefined);
    }
  }