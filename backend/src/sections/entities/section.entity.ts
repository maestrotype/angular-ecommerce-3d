import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { LocalizedString } from '../../common/interfaces/localization.interface';

@Entity('sections')
export class Section {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  type: string; // 'hero', 'about', etc.

  @Column('jsonb', { nullable: true })
  title: LocalizedString;

  @Column('jsonb', { nullable: true })
  subtitle: LocalizedString;

  @Column('jsonb', { nullable: true })
  content: LocalizedString;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ default: 0 })
  order: number;

  @Column({ default: true })
  isActive: boolean;

  @Column('json', { nullable: true })
  settings: Record<string, any>;

  @Column({ nullable: true })
  model3dUrl: string;

  @Column({ default: false })
  show3d: boolean;

  @Column({ default: true })
  showImage: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}