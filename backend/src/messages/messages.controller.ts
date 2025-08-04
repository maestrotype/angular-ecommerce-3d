
import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe, UsePipes, ValidationPipe } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { ApiResponse, PaginatedResponse } from '../shared/models/api-response.model';

@Controller('messages')
@UsePipes(new ValidationPipe({ transform: true }))
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  async createMessage(@Body() createMessageDto: CreateMessageDto): Promise<ApiResponse> {
    const message = await this.messagesService.createMessage(createMessageDto);
    return {
      success: true,
      data: message,
      message: 'Message sent successfully'
    };
  }

  @Get()
  async getAllMessages(
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ): Promise<PaginatedResponse<any>> {
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 10;
    const filters: any = { status, search, page: pageNum, limit: limitNum };
    const messages = await this.messagesService.getAllMessages(filters);
    const count = await this.messagesService.getMessagesCount(filters);
    const totalPages = Math.ceil(count / limitNum);
    
    return {
      data: messages,
      count,
      page: pageNum,
      limit: limitNum,
      totalPages
    };
  }

  @Get('count')
  async getMessagesCount(
    @Query('status') status?: string,
    @Query('search') search?: string
  ): Promise<ApiResponse> {
    const filters: any = { status, search };
    const count = await this.messagesService.getMessagesCount(filters);
    return {
      success: true,
      data: { count }
    };
  }

  @Get('unread')
  async getUnreadCount(): Promise<ApiResponse> {
    const count = await this.messagesService.getUnreadCount();
    return {
      success: true,
      data: { count }
    };
  }

  @Get(':id')
  async getMessageById(@Param('id', ParseIntPipe) id: number): Promise<ApiResponse> {
    const message = await this.messagesService.getMessageById(id);
    return {
      success: true,
      data: message
    };
  }

  @Put(':id')
  async updateMessage(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMessageDto: UpdateMessageDto
  ): Promise<ApiResponse> {
    const message = await this.messagesService.updateMessage(id, updateMessageDto);
    return {
      success: true,
      data: message,
      message: 'Message updated successfully'
    };
  }

  @Delete(':id')
  async deleteMessage(@Param('id', ParseIntPipe) id: number): Promise<ApiResponse> {
    await this.messagesService.deleteMessage(id);
    return {
      success: true,
      message: 'Message deleted successfully'
    };
  }
}
  