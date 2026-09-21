export type MessageStatus = 'new' | 'in_progress' | 'answered' | 'closed';

export interface Message {
  id: number;
  senderName: string;
  senderEmail: string;
  subject: string;
  message: string;
  status: MessageStatus;
  adminResponse?: string;
  respondedAt?: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
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

export interface ReplyMessageDto {
  reply: string;
}
