
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Observable, from, of, throwError } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { Message } from './entities/message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>
  ) {}

  createMessage(createMessageDto: CreateMessageDto): Observable<Message> {
    const message = this.messageRepository.create({
      ...createMessageDto,
      status: 'new'
    });
    
    return from(this.messageRepository.save(message)).pipe(
      catchError(error => throwError(() => new Error(`Failed to create message: ${error.message}`)))
    );
  }

  getAllMessages(filters: any = {}): Observable<Message[]> {
    const queryBuilder = this.messageRepository.createQueryBuilder('message');

    if (filters.status) {
      queryBuilder.andWhere('message.status = :status', { status: filters.status });
    }

    if (filters.search) {
      const searchTerm = `%${filters.search.toLowerCase()}%`;
      queryBuilder.andWhere(
        '(LOWER(message.senderName) LIKE :search OR LOWER(message.senderEmail) LIKE :search OR LOWER(message.subject) LIKE :search OR LOWER(message.message) LIKE :search)',
        { search: searchTerm }
      );
    }

    if (filters.page && filters.limit) {
      const skip = (filters.page - 1) * filters.limit;
      queryBuilder.skip(skip).take(filters.limit);
    }

    queryBuilder.orderBy('message.createdAt', 'DESC');
    
    return from(queryBuilder.getMany()).pipe(
      catchError(error => throwError(() => new Error(`Failed to get messages: ${error.message}`)))
    );
  }

  getMessageById(id: number): Observable<Message> {
    return from(this.messageRepository.findOne({ where: { id } })).pipe(
      map(message => {
        if (!message) {
          throw new NotFoundException(`Message with ID ${id} not found`);
        }
        return message;
      }),
      catchError(error => {
        if (error instanceof NotFoundException) {
          return throwError(() => error);
        }
        return throwError(() => new Error(`Failed to get message: ${error.message}`));
      })
    );
  }

  updateMessage(id: number, updateMessageDto: UpdateMessageDto): Observable<Message> {
    return this.getMessageById(id).pipe(
      switchMap(message => {
        if (updateMessageDto.status) {
          message.status = updateMessageDto.status;
        }

        if (updateMessageDto.adminResponse) {
          message.adminResponse = updateMessageDto.adminResponse;
          message.respondedAt = new Date();
          if (message.status === 'new' || message.status === 'in_progress') {
            message.status = 'answered';
          }
        }

        return from(this.messageRepository.save(message));
      }),
      catchError(error => throwError(() => new Error(`Failed to update message: ${error.message}`)))
    );
  }

  deleteMessage(id: number): Observable<void> {
    return this.getMessageById(id).pipe(
      switchMap(message => from(this.messageRepository.remove(message))),
      map(() => void 0),
      catchError(error => throwError(() => new Error(`Failed to delete message: ${error.message}`)))
    );
  }

  getMessagesCount(filters: any = {}): Observable<number> {
    const queryBuilder = this.messageRepository.createQueryBuilder('message');

    if (filters.status) {
      queryBuilder.andWhere('message.status = :status', { status: filters.status });
    }

    if (filters.search) {
      const searchTerm = `%${filters.search.toLowerCase()}%`;
      queryBuilder.andWhere(
        '(LOWER(message.senderName) LIKE :search OR LOWER(message.senderEmail) LIKE :search OR LOWER(message.subject) LIKE :search OR LOWER(message.message) LIKE :search)',
        { search: searchTerm }
      );
    }

    return from(queryBuilder.getCount()).pipe(
      catchError(error => throwError(() => new Error(`Failed to get messages count: ${error.message}`)))
    );
  }

  getUnreadCount(): Observable<number> {
    return from(this.messageRepository.count({ where: { status: 'new' } })).pipe(
      catchError(error => throwError(() => new Error(`Failed to get unread count: ${error.message}`)))
    );
  }
}
