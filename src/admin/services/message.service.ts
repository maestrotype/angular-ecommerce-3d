import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Message, CreateMessageDto, UpdateMessageDto, ReplyMessageDto } from '../models/message.model';
import { environment } from '../../environments/environment.prod';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private apiUrl = `${environment.apiUrl}/messages`;

  constructor(private http: HttpClient) {}

  getMessages(): Observable<Message[]> {
    return this.http.get<PaginatedResponse<Message>>(this.apiUrl)
      .pipe(
        map(response => response.data)
      );
  }

  getMessage(id: number): Observable<Message> {
    return this.http.get<ApiResponse<Message>>(`${this.apiUrl}/${id}`)
      .pipe(
        map(response => response.data)
      );
  }

  createMessage(message: CreateMessageDto): Observable<Message> {
    return this.http.post<ApiResponse<Message>>(this.apiUrl, message)
      .pipe(
        map(response => response.data)
      );
  }

  updateMessage(id: number, message: UpdateMessageDto): Observable<Message> {
    return this.http.put<ApiResponse<Message>>(`${this.apiUrl}/${id}`, message)
      .pipe(
        map(response => response.data)
      );
  }

  deleteMessage(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`)
      .pipe(
        map(() => void 0)
      );
  }

  markAsRead(id: number): Observable<Message> {
    return this.http.put<ApiResponse<Message>>(`${this.apiUrl}/${id}`, { status: 'in_progress' })
      .pipe(
        map(response => response.data)
      );
  }

  markAsArchived(id: number): Observable<Message> {
    return this.http.put<ApiResponse<Message>>(`${this.apiUrl}/${id}`, { status: 'closed' })
      .pipe(
        map(response => response.data)
      );
  }

  replyToMessage(id: number, reply: ReplyMessageDto): Observable<Message> {
    return this.http.put<ApiResponse<Message>>(`${this.apiUrl}/${id}`, { 
      status: 'answered',
      adminResponse: reply.reply 
    })
      .pipe(
        map(response => response.data)
      );
  }
}