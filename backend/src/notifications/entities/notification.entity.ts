import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum NotificationType {
  ORDER_CREATED = 'order_created',
  ORDER_UPDATED = 'order_updated',
  LOW_STOCK = 'low_stock',
  NEW_USER = 'new_user',
  SYSTEM = 'system'
}

export enum NotificationStatus {
  UNREAD = 'unread',
  READ = 'read'
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: NotificationType
  })
  type: NotificationType;

  @Column()
  title: string;

  @Column('text')
  message: string;

  @Column('json', { nullable: true })
  data: any;

  @Column({
    type: 'enum',
    enum: NotificationStatus,
    default: NotificationStatus.UNREAD
  })
  status: NotificationStatus;

  @Column({ nullable: true })
  userId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}