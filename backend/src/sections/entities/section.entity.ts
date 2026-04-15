import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('sections')
export class Section {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  type: string; // 'hero', 'about', etc.

  @Column('jsonb', { nullable: true })
  title: any;

  @Column('jsonb', { nullable: true })
  subtitle: any;

  @Column('jsonb', { nullable: true })
  content: any;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ default: 0 })
  order: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  settings: Record<string, any>;

  @Column({ type: 'varchar', default: 'home' })
  pageTarget: string; // 'home', 'product', 'about', or custom slug

  @Column({ type: 'varchar', default: 'default' })
  variant: string; // 'default', 'glass', 'minimal', etc.

  @Column({ type: 'varchar', nullable: true })
  anchorId: string; // For scroll-to-section navigation

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