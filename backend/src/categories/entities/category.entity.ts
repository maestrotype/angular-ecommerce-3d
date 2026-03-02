import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { LocalizedString } from '../../common/interfaces/localization.interface';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id: string;

  @Column('jsonb', { nullable: true })
  name: LocalizedString;

  @Column({ unique: true, nullable: true })
  slug: string;

  @Column({ nullable: true })
  icon: string;

  @Column('jsonb', { nullable: true })
  description: LocalizedString;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}