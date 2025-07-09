
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { ReplyMessageDto } from './dto/reply-message.dto';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  async create(createMessageDto: CreateMessageDto): Promise<Message> {
    const message = this.messageRepository.create(createMessageDto);
    return await this.messageRepository.save(message);
  }

  async findAll(status?: string, search?: string): Promise<Message[]> {
    const query = this.messageRepository.createQueryBuilder('message');

    if (status && status !== 'all') {
      query.andWhere('message.status = :status', { status });
    }

    if (search) {
      query.andWhere(
        '(message.senderName ILIKE :search OR message.senderEmail ILIKE :search OR message.subject ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    return await query.orderBy('message.createdAt', 'DESC').getMany();
  }

  async findOne(id: number): Promise<Message> {
    const message = await this.messageRepository.findOne({ where: { id } });
    if (!message) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }
    return message;
  }

  async update(id: number, updateMessageDto: UpdateMessageDto): Promise<Message> {
    const message = await this.findOne(id);
    Object.assign(message, updateMessageDto);
    return await this.messageRepository.save(message);
  }

  async reply(id: number, replyMessageDto: ReplyMessageDto): Promise<Message> {
    const message = await this.findOne(id);
    message.adminReply = replyMessageDto.reply;
    message.repliedAt = new Date();
    message.status = 'read';
    return await this.messageRepository.save(message);
  }

  async remove(id: number): Promise<void> {
    const message = await this.findOne(id);
    await this.messageRepository.remove(message);
  }

  async markAsRead(id: number): Promise<Message> {
    return await this.update(id, { status: 'read' });
  }

  async markAsArchived(id: number): Promise<Message> {
    return await this.update(id, { status: 'archived' });
  }
}
