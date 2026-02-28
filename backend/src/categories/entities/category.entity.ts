import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id: string;

  @Column('jsonb', { nullable: true })
  name: any;

  @Column({ unique: true, nullable: true })
  slug: string;

  @Column({ nullable: true })
  icon: string;

  @Column('jsonb', { nullable: true })
  description: any;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}