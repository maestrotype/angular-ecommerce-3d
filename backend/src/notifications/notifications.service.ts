import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType, NotificationStatus } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  async create(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    const notification = this.notificationRepository.create(createNotificationDto);
    return await this.notificationRepository.save(notification);
  }

  async findAll(userId?: number): Promise<Notification[]> {
    const query = this.notificationRepository.createQueryBuilder('notification');
    
    if (userId) {
      query.where('notification.userId = :userId OR notification.userId IS NULL', { userId });
    } else {
      query.where('notification.userId IS NULL');
    }
    
    return await query
      .orderBy('notification.createdAt', 'DESC')
      .getMany();
  }

  async findUnread(userId?: number): Promise<Notification[]> {
    const query = this.notificationRepository.createQueryBuilder('notification')
      .where('notification.status = :status', { status: NotificationStatus.UNREAD });
    
    if (userId) {
      query.andWhere('notification.userId = :userId OR notification.userId IS NULL', { userId });
    } else {
      query.andWhere('notification.userId IS NULL');
    }
    
    return await query
      .orderBy('notification.createdAt', 'DESC')
      .getMany();
  }

  async markAsRead(id: number): Promise<Notification> {
    await this.notificationRepository.update(id, { status: NotificationStatus.READ });
    return await this.notificationRepository.findOne({ where: { id } });
  }

  async markAllAsRead(userId?: number): Promise<void> {
    const query = this.notificationRepository.createQueryBuilder()
      .update(Notification)
      .set({ status: NotificationStatus.READ })
      .where('status = :status', { status: NotificationStatus.UNREAD });
    
    if (userId) {
      query.andWhere('userId = :userId OR userId IS NULL', { userId });
    } else {
      query.andWhere('userId IS NULL');
    }
    
    await query.execute();
  }

  async getUnreadCount(userId?: number): Promise<number> {
    const query = this.notificationRepository.createQueryBuilder('notification')
      .where('notification.status = :status', { status: NotificationStatus.UNREAD });
    
    if (userId) {
      query.andWhere('notification.userId = :userId OR notification.userId IS NULL', { userId });
    } else {
      query.andWhere('notification.userId IS NULL');
    }
    
    return await query.getCount();
  }

  // Helper methods for creating specific notifications
  async createOrderNotification(orderId: number, customerName: string): Promise<Notification> {
    return await this.create({
      type: NotificationType.ORDER_CREATED,
      title: 'New Order Received',
      message: `Order #${orderId} from ${customerName} has been received`,
      data: { orderId, customerName }
    });
  }

  async createLowStockNotification(productName: string, stock: number): Promise<Notification> {
    return await this.create({
      type: NotificationType.LOW_STOCK,
      title: 'Low Stock Alert',
      message: `${productName} is running low on stock (${stock} remaining)`,
      data: { productName, stock }
    });
  }

  async createNewUserNotification(userName: string, userEmail: string): Promise<Notification> {
    return await this.create({
      type: NotificationType.NEW_USER,
      title: 'New User Registration',
      message: `${userName} (${userEmail}) has registered`,
      data: { userName, userEmail }
    });
  }
}