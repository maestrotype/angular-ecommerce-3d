
import { Injectable, NotFoundException } from '@nestjs/common';
import { Message, CreateMessageDto, UpdateMessageDto, MessageFilters, MessageStatus } from '../shared/models/message.model';

@Injectable()
export class MessagesService {
  private messages: Message[] = [];
  private nextId = 1;

  async createMessage(createMessageDto: CreateMessageDto): Promise<Message> {
    const message: Message = {
      id: this.nextId++,
      ...createMessageDto,
      status: MessageStatus.NEW,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.messages.push(message);
    return message;
  }

  async getAllMessages(filters: MessageFilters = {}): Promise<Message[]> {
    let filteredMessages = [...this.messages];

    if (filters.status) {
      filteredMessages = filteredMessages.filter(msg => msg.status === filters.status);
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredMessages = filteredMessages.filter(msg =>
        msg.senderName.toLowerCase().includes(searchTerm) ||
        msg.senderEmail.toLowerCase().includes(searchTerm) ||
        msg.subject.toLowerCase().includes(searchTerm) ||
        msg.message.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.page && filters.limit) {
      const start = (filters.page - 1) * filters.limit;
      const end = start + filters.limit;
      filteredMessages = filteredMessages.slice(start, end);
    }

    return filteredMessages.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getMessageById(id: number): Promise<Message> {
    const message = this.messages.find(msg => msg.id === id);
    if (!message) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }
    return message;
  }

  async updateMessage(id: number, updateMessageDto: UpdateMessageDto): Promise<Message> {
    const messageIndex = this.messages.findIndex(msg => msg.id === id);
    if (messageIndex === -1) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }

    const message = this.messages[messageIndex];
    
    if (updateMessageDto.status) {
      message.status = updateMessageDto.status;
    }

    if (updateMessageDto.adminResponse) {
      message.adminResponse = updateMessageDto.adminResponse;
      message.respondedAt = new Date();
      if (message.status === MessageStatus.NEW || message.status === MessageStatus.IN_PROGRESS) {
        message.status = MessageStatus.ANSWERED;
      }
    }

    message.updatedAt = new Date();
    this.messages[messageIndex] = message;

    return message;
  }

  async deleteMessage(id: number): Promise<void> {
    const messageIndex = this.messages.findIndex(msg => msg.id === id);
    if (messageIndex === -1) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }

    this.messages.splice(messageIndex, 1);
  }

  async getMessagesCount(filters: MessageFilters = {}): Promise<number> {
    let filteredMessages = [...this.messages];

    if (filters.status) {
      filteredMessages = filteredMessages.filter(msg => msg.status === filters.status);
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredMessages = filteredMessages.filter(msg =>
        msg.senderName.toLowerCase().includes(searchTerm) ||
        msg.senderEmail.toLowerCase().includes(searchTerm) ||
        msg.subject.toLowerCase().includes(searchTerm) ||
        msg.message.toLowerCase().includes(searchTerm)
      );
    }

    return filteredMessages.length;
  }

  async getUnreadCount(): Promise<number> {
    return this.messages.filter(msg => msg.status === MessageStatus.NEW).length;
  }
}
