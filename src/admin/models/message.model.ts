
export interface Message {
  id: number;
  senderName: string;
  senderEmail: string;
  subject: string;
  message: string;
  status: 'new' | 'in_progress' | 'answered' | 'closed';
  adminResponse?: string;
  respondedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMessageDto {
  senderName: string;
  senderEmail: string;
  subject: string;
  message: string;
}

export interface UpdateMessageDto {
  status?: 'new' | 'in_progress' | 'answered' | 'closed';
  adminResponse?: string;
}

export interface ReplyMessageDto {
  reply: string;
}
  