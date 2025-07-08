
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
  async getUnreadCount(@Query('userId') userId?: string) {
    const count = await this.notificationsService.getUnreadCount(userId ? +userId : undefined);
    return { count };
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(+id);
  }

  @Patch('read-all')
  async markAllAsRead(@Query('userId') userId?: string) {
    await this.notificationsService.markAllAsRead(userId ? +userId : undefined);
    return { message: 'All notifications marked as read' };
  }
}
