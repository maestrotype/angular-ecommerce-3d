
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Message, CreateMessageDto, UpdateMessageDto, ReplyMessageDto } from '../models/message.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private apiUrl = `${environment.apiUrl}/messages`;

  constructor(private http: HttpClient) {}

  getMessages(status?: string, search?: string): Observable<Message[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    if (search) params = params.set('search', search);
    
    return this.http.get<Message[]>(this.apiUrl, { params });
  }

  getMessage(id: number): Observable<Message> {
    return this.http.get<Message>(`${this.apiUrl}/${id}`);
  }

  createMessage(message: CreateMessageDto): Observable<Message> {
    return this.http.post<Message>(this.apiUrl, message);
  }

  updateMessage(id: number, message: UpdateMessageDto): Observable<Message> {
    return this.http.patch<Message>(`${this.apiUrl}/${id}`, message);
  }

  replyToMessage(id: number, reply: ReplyMessageDto): Observable<Message> {
    return this.http.post<Message>(`${this.apiUrl}/${id}/reply`, reply);
  }

  markAsRead(id: number): Observable<Message> {
    return this.http.patch<Message>(`${this.apiUrl}/${id}/mark-read`, {});
  }

  markAsArchived(id: number): Observable<Message> {
    return this.http.patch<Message>(`${this.apiUrl}/${id}/archive`, {});
  }

  deleteMessage(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
