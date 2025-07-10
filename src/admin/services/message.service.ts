import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Message, CreateMessageDto, UpdateMessageDto, ReplyMessageDto } from '../models/message.model';
import { environment } from '../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private apiUrl = `${environment.apiUrl}/messages`;

  constructor(private http: HttpClient) {}

  getMessages(): Observable<Message[]> {
    return this.http.get<Message[]>(this.apiUrl);
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

  deleteMessage(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  markAsRead(id: number): Observable<Message> {
    return this.http.patch<Message>(`${this.apiUrl}/${id}/read`, {});
  }

  markAsArchived(id: number): Observable<Message> {
    return this.http.patch<Message>(`${this.apiUrl}/${id}/archive`, {});
  }

  replyToMessage(id: number, reply: ReplyMessageDto): Observable<Message> {
    return this.http.post<Message>(`${this.apiUrl}/${id}/reply`, reply);
  }
}