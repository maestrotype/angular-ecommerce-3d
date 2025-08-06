
import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe, UsePipes, ValidationPipe } from '@nestjs/common';
import { Observable, combineLatest, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { ApiResponse, PaginatedResponse } from '../shared/models/api-response.model';

@Controller('messages')
@UsePipes(new ValidationPipe({ transform: true }))
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  createMessage(@Body() createMessageDto: CreateMessageDto): Observable<ApiResponse> {
    return this.messagesService.createMessage(createMessageDto).pipe(
      map(message => ({
        success: true,
        data: message,
        message: 'Message sent successfully'
      })),
      catchError(error => of({
        success: false,
        error: error.message
      }))
    );
  }

  @Get()
  getAllMessages(
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ): Observable<PaginatedResponse<any>> {
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 10;
    const filters: any = { status, search, page: pageNum, limit: limitNum };
    
    return combineLatest([
      this.messagesService.getAllMessages(filters),
      this.messagesService.getMessagesCount(filters)
    ]).pipe(
      map(([messages, count]) => {
        const totalPages = Math.ceil(count / limitNum);
        return {
          data: messages,
          count,
          page: pageNum,
          limit: limitNum,
          totalPages
        };
      }),
      catchError(error => of({
        data: [],
        count: 0,
        page: pageNum,
        limit: limitNum,
        totalPages: 0
      }))
    );
  }

  @Get('count')
  getMessagesCount(
    @Query('status') status?: string,
    @Query('search') search?: string
  ): Observable<ApiResponse> {
    const filters: any = { status, search };
    
    return this.messagesService.getMessagesCount(filters).pipe(
      map(count => ({
        success: true,
        data: { count }
      })),
      catchError(error => of({
        success: false,
        error: error.message
      }))
    );
  }

  @Get('unread')
  getUnreadCount(): Observable<ApiResponse> {
    return this.messagesService.getUnreadCount().pipe(
      map(count => ({
        success: true,
        data: { count }
      })),
      catchError(error => of({
        success: false,
        error: error.message
      }))
    );
  }

  @Get(':id')
  getMessageById(@Param('id', ParseIntPipe) id: number): Observable<ApiResponse> {
    return this.messagesService.getMessageById(id).pipe(
      map(message => ({
        success: true,
        data: message
      })),
      catchError(error => of({
        success: false,
        error: error.message
      }))
    );
  }

  @Put(':id')
  updateMessage(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMessageDto: UpdateMessageDto
  ): Observable<ApiResponse> {
    return this.messagesService.updateMessage(id, updateMessageDto).pipe(
      map(message => ({
        success: true,
        data: message,
        message: 'Message updated successfully'
      })),
      catchError(error => of({
        success: false,
        error: error.message
      }))
    );
  }

  @Delete(':id')
  deleteMessage(@Param('id', ParseIntPipe) id: number): Observable<ApiResponse> {
    return this.messagesService.deleteMessage(id).pipe(
      map(() => ({
        success: true,
        message: 'Message deleted successfully'
      })),
      catchError(error => of({
        success: false,
        error: error.message
      }))
    );
  }
}
  