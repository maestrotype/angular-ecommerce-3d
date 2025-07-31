export interface Message {
  id: number;
  senderName: string;
  senderEmail: string;
  subject: string;
  message: string;
  status: MessageStatus;
  createdAt: Date;
  updatedAt: Date;
  adminResponse?: string;
  respondedAt?: Date;
}

export enum MessageStatus {
  NEW = 'new',
  IN_PROGRESS = 'in_progress',
  ANSWERED = 'answered',
  CLOSED = 'closed'
}

export interface CreateMessageDto {
  senderName: string;
  senderEmail: string;
  subject: string;
  message: string;
}

export interface UpdateMessageDto {
  status?: MessageStatus;
  adminResponse?: string;
}

export interface MessageFilters {
  status?: MessageStatus;
  search?: string;
  page?: number;
  limit?: number;
} 