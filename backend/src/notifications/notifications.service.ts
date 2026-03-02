import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Observable, from, throwError } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { Notification, NotificationStatus, NotificationType } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) { }

  create(createNotificationDto: CreateNotificationDto): Observable<Notification> {
    const notification = this.notificationRepository.create(createNotificationDto);

    return from(this.notificationRepository.save(notification as any) as Promise<Notification>).pipe(
      catchError(error => throwError(() => new Error(`Failed to create notification: ${error.message}`)))
    );
  }

  findAll(userId?: number): Observable<Notification[]> {
    const query = this.notificationRepository.createQueryBuilder('notification');

    if (userId) {
      query.where('notification.userId = :userId OR notification.userId IS NULL', { userId });
    } else {
      query.where('notification.userId IS NULL');
    }

    return from(query
      .orderBy('notification.createdAt', 'DESC')
      .getMany()
    ).pipe(
      catchError(error => throwError(() => new Error(`Failed to get notifications: ${error.message}`)))
    );
  }

  findUnread(userId?: number): Observable<Notification[]> {
    const query = this.notificationRepository.createQueryBuilder('notification')
      .where('notification.status = :status', { status: NotificationStatus.UNREAD });

    if (userId) {
      query.andWhere('notification.userId = :userId OR notification.userId IS NULL', { userId });
    } else {
      query.andWhere('notification.userId IS NULL');
    }

    return from(query
      .orderBy('notification.createdAt', 'DESC')
      .getMany()
    ).pipe(
      catchError(error => throwError(() => new Error(`Failed to get unread notifications: ${error.message}`)))
    );
  }

  markAsRead(id: number): Observable<Notification> {
    return from(this.notificationRepository.update(id, { status: NotificationStatus.READ })).pipe(
      switchMap(() => from(this.notificationRepository.findOne({ where: { id } }))),
      map(notification => {
        if (!notification) {
          throw new Error(`Notification with ID ${id} not found`);
        }
        return notification;
      }),
      catchError(error => throwError(() => new Error(`Failed to mark notification as read: ${error.message}`)))
    );
  }

  markAllAsRead(userId?: number): Observable<void> {
    const query = this.notificationRepository.createQueryBuilder()
      .update(Notification)
      .set({ status: NotificationStatus.READ })
      .where('status = :status', { status: NotificationStatus.UNREAD });

    if (userId) {
      query.andWhere('userId = :userId OR userId IS NULL', { userId });
    } else {
      query.andWhere('userId IS NULL');
    }

    return from(query.execute()).pipe(
      map(() => void 0),
      catchError(error => throwError(() => new Error(`Failed to mark all notifications as read: ${error.message}`)))
    );
  }

  getUnreadCount(userId?: number): Observable<number> {
    const query = this.notificationRepository.createQueryBuilder('notification')
      .where('notification.status = :status', { status: NotificationStatus.UNREAD });

    if (userId) {
      query.andWhere('notification.userId = :userId OR notification.userId IS NULL', { userId });
    } else {
      query.andWhere('notification.userId IS NULL');
    }

    return from(query.getCount()).pipe(
      catchError(error => throwError(() => new Error(`Failed to get unread count: ${error.message}`)))
    );
  }

  // Helper methods for creating specific notifications
  createOrderNotification(orderId: number, customerName: string): Observable<Notification> {
    return this.create({
      type: NotificationType.ORDER_CREATED,
      title: 'New Order Received',
      message: `Order #${orderId} from ${customerName} has been received`,
      data: { orderId, customerName }
    });
  }

  createLowStockNotification(productName: string, stock: number): Observable<Notification> {
    return this.create({
      type: NotificationType.LOW_STOCK,
      title: 'Low Stock Alert',
      message: `${productName} is running low on stock (${stock} remaining)`,
      data: { productName, stock }
    });
  }

  createNewUserNotification(userName: string, userEmail: string): Observable<Notification> {
    return this.create({
      type: NotificationType.NEW_USER,
      title: 'New User Registration',
      message: `${userName} (${userEmail}) has registered`,
      data: { userName, userEmail }
    });
  }
}