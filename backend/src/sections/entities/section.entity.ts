
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('sections')
export class Section {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: 'hero' | 'about' | 'contact' | 'promo' | 'features' | 'testimonials';

  @Column()
  title: string;

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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
