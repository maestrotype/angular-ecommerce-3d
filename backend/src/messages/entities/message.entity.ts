
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
  status: 'new' | 'in_progress' | 'answered' | 'closed';

  @Column({ nullable: true })
  adminResponse: string;

  @Column({ nullable: true })
  respondedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
