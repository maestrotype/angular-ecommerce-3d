
export interface Message {
    id: number;
    senderName: string;
    senderEmail: string;
    subject: string;
    message: string;
    status: 'new' | 'read' | 'archived';
    adminReply?: string;
    repliedAt?: Date;
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
    status?: 'new' | 'read' | 'archived';
    adminReply?: string;
  }
  
  export interface ReplyMessageDto {
    reply: string;
  }
  