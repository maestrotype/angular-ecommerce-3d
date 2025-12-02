
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, interval } from 'rxjs';
import { switchMap, catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment.prod';

export interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  data?: any;
  status: 'unread' | 'read';
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = environment.apiUrl + '/notifications';
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  private unreadCountSubject = new BehaviorSubject<number>(0);
  
  public notifications$ = this.notificationsSubject.asObservable();
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {
    this.startPolling();
    this.loadNotifications().subscribe();
  }

  private startPolling(): void {
    interval(10000).pipe(
      switchMap(() => this.loadNotifications()),
      catchError(error => {
        
        return [];
      })
    ).subscribe();
  }

  loadNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(this.apiUrl).pipe(
      catchError(error => {
        
        return [];
      })
    );
  }

  getUnreadCount(): Observable<number> {
    return this.http.get<{ count: number }>(`${this.apiUrl}/unread/count`).pipe(
      map(res => res.count),
      catchError(error => {
        
        return [0];
      })
    );
  }

  markAsRead(id: number): Observable<Notification> {
    return this.http.patch<Notification>(`${this.apiUrl}/${id}/read`, {}).pipe(
      catchError(error => {
        
        this.updateLocalNotificationStatus(id, 'read');
        throw error;
      })
    );
  }

  markAllAsRead(): Observable<any> {
    return this.http.patch(`${this.apiUrl}/read-all`, {}).pipe(
      catchError(error => {
        
        this.updateAllLocalNotificationsStatus('read');
        throw error;
      })
    );
  }

  private updateLocalNotificationStatus(id: number, status: 'read' | 'unread'): void {
    const notifications = this.notificationsSubject.value.map(n => 
      n.id === id ? { ...n, status } : n
    );
    this.notificationsSubject.next(notifications);
    this.updateUnreadCount();
  }

  private updateAllLocalNotificationsStatus(status: 'read' | 'unread'): void {
    const notifications = this.notificationsSubject.value.map(n => ({ ...n, status }));
    this.notificationsSubject.next(notifications);
    this.updateUnreadCount();
  }

  private updateUnreadCount(): void {
    const count = this.notificationsSubject.value.filter(n => n.status === 'unread').length;
    this.unreadCountSubject.next(count);
  }

  updateNotifications(notifications: Notification[]): void {
    this.notificationsSubject.next(notifications.slice(0, 10));
    this.updateUnreadCount();
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'order_created':
      case 'order_updated':
        return 'shopping_cart';
      case 'low_stock':
        return 'inventory';
      case 'new_user':
        return 'person_add';
      case 'system':
        return 'settings';
      default:
        return 'notifications';
    }
  }

  getNotificationColor(type: string): string {
    switch (type) {
      case 'order_created':
        return 'primary';
      case 'order_updated':
        return 'accent';
      case 'low_stock':
        return 'warn';
      case 'new_user':
        return 'primary';
      case 'system':
        return 'basic';
      default:
        return 'basic';
    }
  }
}
