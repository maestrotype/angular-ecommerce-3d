import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';

export enum RecommendationType {
  SIMILAR = 'similar',
  BOUGHT_TOGETHER = 'bought_together',
  PERSONALIZED = 'personalized'
}

@Entity('product_recommendations')
export class ProductRecommendation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  productId: number;

  @Column()
  recommendedProductId: number;

  @Column({
    type: 'enum',
    enum: RecommendationType,
    default: RecommendationType.SIMILAR
  })
  type: RecommendationType;

  @Column('decimal', { precision: 5, scale: 4, default: 1.0 })
  score: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'recommendedProductId' })
  recommendedProduct: Product;
} 