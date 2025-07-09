
import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    UseGuards,
  } from '@nestjs/common';
  import { MessagesService } from './messages.service';
  import { CreateMessageDto } from './dto/create-message.dto';
  import { UpdateMessageDto } from './dto/update-message.dto';
  import { ReplyMessageDto } from './dto/reply-message.dto';
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
  
  @Controller('messages')
  export class MessagesController {
    constructor(private readonly messagesService: MessagesService) {}
  
    @Post()
    create(@Body() createMessageDto: CreateMessageDto) {
      return this.messagesService.create(createMessageDto);
    }
  
    @Get()
    @UseGuards(JwtAuthGuard)
    findAll(@Query('status') status?: string, @Query('search') search?: string) {
      return this.messagesService.findAll(status, search);
    }
  
    @Get(':id')
    @UseGuards(JwtAuthGuard)
    findOne(@Param('id') id: string) {
      return this.messagesService.findOne(+id);
    }
  
    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    update(@Param('id') id: string, @Body() updateMessageDto: UpdateMessageDto) {
      return this.messagesService.update(+id, updateMessageDto);
    }
  
    @Post(':id/reply')
    @UseGuards(JwtAuthGuard)
    reply(@Param('id') id: string, @Body() replyMessageDto: ReplyMessageDto) {
      return this.messagesService.reply(+id, replyMessageDto);
    }
  
    @Patch(':id/mark-read')
    @UseGuards(JwtAuthGuard)
    markAsRead(@Param('id') id: string) {
      return this.messagesService.markAsRead(+id);
    }
  
    @Patch(':id/archive')
    @UseGuards(JwtAuthGuard)
    markAsArchived(@Param('id') id: string) {
      return this.messagesService.markAsArchived(+id);
    }
  
    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    remove(@Param('id') id: string) {
      return this.messagesService.remove(+id);
    }
  }
  