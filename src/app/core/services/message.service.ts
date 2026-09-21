import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import {
  Message,
  CreateMessageDto,
  UpdateMessageDto,
  MessageStatus,
} from '../../../shared/models/message.model';
import { environment } from '../../../environments/environment';

export type { Message, CreateMessageDto, UpdateMessageDto, MessageStatus };

export interface MessageFilters {
  status?: MessageStatus;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  count?: number;
}

export interface PaginatedResponse<T> {
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

  constructor(private http: HttpClient) { }

  createMessage(messageData: CreateMessageDto): Observable<ApiResponse<Message>> {
    return this.http.post<ApiResponse<Message>>(this.apiUrl, messageData)
      .pipe(
        catchError(error => {

          return of({
            success: false,
            error: 'Failed to send message'
          });
        })
      );
  }

  getAllMessages(filters: MessageFilters = {}): Observable<PaginatedResponse<Message>> {
    let params = new HttpParams();

    if (filters.status) {
      params = params.set('status', filters.status);
    }
    if (filters.search) {
      params = params.set('search', filters.search);
    }
    if (filters.page) {
      params = params.set('page', filters.page.toString());
    }
    if (filters.limit) {
      params = params.set('limit', filters.limit.toString());
    }

    return this.http.get<PaginatedResponse<Message>>(this.apiUrl, { params })
      .pipe(
        catchError(error => {

          return of({
            data: [],
            count: 0,
            page: 1,
            limit: 10,
            totalPages: 0
          });
        })
      );
  }

  getMessageById(id: number): Observable<ApiResponse<Message>> {
    return this.http.get<ApiResponse<Message>>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(error => {

          return of({
            success: false,
            error: 'Failed to fetch message'
          });
        })
      );
  }

  updateMessage(id: number, updateData: UpdateMessageDto): Observable<ApiResponse<Message>> {
    return this.http.put<ApiResponse<Message>>(`${this.apiUrl}/${id}`, updateData)
      .pipe(
        catchError(error => {

          return of({
            success: false,
            error: 'Failed to update message'
          });
        })
      );
  }

  deleteMessage(id: number): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(error => {

          return of({
            success: false,
            error: 'Failed to delete message'
          });
        })
      );
  }

  getMessagesCount(filters: MessageFilters = {}): Observable<ApiResponse<{ count: number }>> {
    let params = new HttpParams();

    if (filters.status) {
      params = params.set('status', filters.status);
    }
    if (filters.search) {
      params = params.set('search', filters.search);
    }

    return this.http.get<ApiResponse<{ count: number }>>(`${this.apiUrl}/count`, { params })
      .pipe(
        catchError(error => {

          return of({
            success: false,
            data: { count: 0 }
          });
        })
      );
  }

  getUnreadCount(): Observable<ApiResponse<{ count: number }>> {
    return this.http.get<ApiResponse<{ count: number }>>(`${this.apiUrl}/unread`)
      .pipe(
        catchError(error => {

          return of({
            success: false,
            data: { count: 0 }
          });
        })
      );
  }
} 