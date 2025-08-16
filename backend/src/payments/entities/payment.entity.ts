import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export enum PaymentMethod {
  LIQPAY = 'liqpay',
  STRIPE = 'stripe',
  PAYPAL = 'paypal'
}

export enum Currency {
  UAH = 'UAH',
  USD = 'USD',
  EUR = 'EUR'
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int')
  orderId: number;

  @Column('decimal', { precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'enum', enum: Currency })
  currency: Currency;

  @Column({ type: 'enum', enum: PaymentMethod })
  paymentMethod: PaymentMethod;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  transactionId?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  liqpayPaymentId?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  customerEmail?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  customerPhone?: string;

  @Column({ type: 'text', nullable: true })
  metadata?: string;

  @Column({ type: 'text', nullable: true })
  errorMessage?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 