
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  senderName: string;

  @Column()
  senderEmail: string;

  @Column()
  subject: string;

  @Column('text')
  message: string;

  @Column({ default: 'new' })
  status: 'new' | 'read' | 'archived';

  @Column({ nullable: true })
  adminReply: string;

  @Column({ nullable: true })
  repliedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
