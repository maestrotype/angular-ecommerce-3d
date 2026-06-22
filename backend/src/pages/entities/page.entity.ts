import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export type PageTemplate = 'simple' | 'sections' | 'contact';
export type PageStatus = 'draft' | 'published';

@Entity('pages')
export class Page {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  slug: string;

  @Column('jsonb')
  title: Record<string, string>;

  @Column('jsonb', { nullable: true })
  content: Record<string, string>;

  @Column('jsonb', { nullable: true })
  seoDescription: Record<string, string>;

  @Column({ type: 'varchar', default: 'simple' })
  template: PageTemplate;

  @Column({ type: 'varchar', default: 'published' })
  status: PageStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
