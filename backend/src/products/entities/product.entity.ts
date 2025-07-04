
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 100 })
  category: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('int', { default: 0 })
  stock: number;

  @Column('text')
  description: string;

  @Column({ length: 500, nullable: true })
  imageUrl: string;

  @Column('jsonb', { nullable: true, default: {} })
  specifications: Record<string, string>;

  @Column('decimal', { precision: 3, scale: 2, nullable: true })
  discount: number;

  @Column({ default: false })
  isSpecial: boolean;

  @Column('decimal', { precision: 2, scale: 1, nullable: true })
  rating: number;

  @Column('simple-array', { nullable: true })
  features: string[];

  @Column('simple-array', { nullable: true })
  images: string[];

  @Column({ type: 'bytea', nullable: true })
  imageData: Buffer;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
