import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('sections')
export class Section {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  type: string; // 'hero', 'about', etc.

  @Column()
  title: string;

  @Column()
  subtitle: string;

  @Column('text', { nullable: true })
  content: string;

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