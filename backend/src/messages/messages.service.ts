
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>
  ) {}

  async createMessage(createMessageDto: CreateMessageDto): Promise<Message> {
    const message = this.messageRepository.create({
      ...createMessageDto,
      status: 'new'
    });
    return await this.messageRepository.save(message);
  }

  async getAllMessages(filters: any = {}): Promise<Message[]> {
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
    return await queryBuilder.getMany();
  }

  async getMessageById(id: number): Promise<Message> {
    const message = await this.messageRepository.findOne({ where: { id } });
    if (!message) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }
    return message;
  }

  async updateMessage(id: number, updateMessageDto: UpdateMessageDto): Promise<Message> {
    const message = await this.getMessageById(id);
    
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

    return await this.messageRepository.save(message);
  }

  async deleteMessage(id: number): Promise<void> {
    const message = await this.getMessageById(id);
    await this.messageRepository.remove(message);
  }

  async getMessagesCount(filters: any = {}): Promise<number> {
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

    return await queryBuilder.getCount();
  }

  async getUnreadCount(): Promise<number> {
    return await this.messageRepository.count({ where: { status: 'new' } });
  }
}
