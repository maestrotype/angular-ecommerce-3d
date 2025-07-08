import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, interval, of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
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
  private apiUrl = environment.apiUrl + 'notifications';
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  private unreadCountSubject = new BehaviorSubject<number>(0);
  
  public notifications$ = this.notificationsSubject.asObservable();
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {
    this.startPolling();
  }

  private startPolling(): void {
    // Поллинг каждые 30 секунд для получения новых уведомлений
    interval(30000).pipe(
      switchMap(() => this.loadNotifications()),
      catchError(error => {
        console.error('Error polling notifications:', error);
        return of([]);
      })
    ).subscribe();

    // Загружаем уведомления при инициализации
    this.loadNotifications().subscribe();
  }

  loadNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(this.apiUrl).pipe(
      catchError(error => {
        console.warn('API notifications failed, using mock data:', error);
        return this.getMockNotifications();
      })
    );
  }

  private getMockNotifications(): Observable<Notification[]> {
    const mockNotifications: Notification[] = [
      {
        id: 1,
        type: 'order_created',
        title: 'New order received',
        message: 'Order #123 from John Doe has been received',
        status: 'unread',
        createdAt: new Date(),
        data: { orderId: 123, customerName: 'John Doe' }
      },
      {
        id: 2,
        type: 'low_stock',
        title: 'Low stock alert',
        message: 'Product "Gaming Headset" is running low on stock (3 remaining)',
        status: 'unread',
        createdAt: new Date(Date.now() - 1000 * 60 * 30),
        data: { productName: 'Gaming Headset', stock: 3 }
      },
      {
        id: 3,
        type: 'new_user',
        title: 'New user registration',
        message: 'Jane Smith (jane@example.com) has registered',
        status: 'read',
        createdAt: new Date(Date.now() - 1000 * 60 * 60),
        data: { userName: 'Jane Smith', userEmail: 'jane@example.com' }
      }
    ];

    this.notificationsSubject.next(mockNotifications);
    this.unreadCountSubject.next(mockNotifications.filter(n => n.status === 'unread').length);
    
    return of(mockNotifications);
  }

  getUnreadCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.apiUrl}/unread/count`).pipe(
      catchError(() => {
        const count = this.notificationsSubject.value.filter(n => n.status === 'unread').length;
        return of({ count });
      })
    );
  }

  markAsRead(id: number): Observable<Notification> {
    return this.http.patch<Notification>(`${this.apiUrl}/${id}/read`, {}).pipe(
      catchError(error => {
        console.warn('Mark as read failed, updating locally:', error);
        const notifications = this.notificationsSubject.value;
        const notification = notifications.find(n => n.id === id);
        if (notification) {
          notification.status = 'read';
          this.notificationsSubject.next([...notifications]);
          this.updateUnreadCount();
          return of(notification);
        }
        throw error;
      })
    );
  }

  markAllAsRead(): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/read-all`, {}).pipe(
      catchError(error => {
        console.warn('Mark all as read failed, updating locally:', error);
        const notifications = this.notificationsSubject.value.map(n => ({ ...n, status: 'read' as const }));
        this.notificationsSubject.next(notifications);
        this.unreadCountSubject.next(0);
        return of(undefined);
      })
    );
  }

  private updateUnreadCount(): void {
    const count = this.notificationsSubject.value.filter(n => n.status === 'unread').length;
    this.unreadCountSubject.next(count);
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
