import { RecommendationType } from '../entities/product-recommendation.entity';
import { Localizable } from '../../common/interfaces/localization.interface';

export class RecommendationProductDto {
  id: number;
  name: Localizable;
  price: number;
  imageUrl: string;
  category: string;
  rating?: number;
  discount?: number;
  isSpecial?: boolean;
  score: number;
}

export class SimilarProductsResponseDto {
  productId: number;
  similarProducts: RecommendationProductDto[];
}

export class BoughtTogetherResponseDto {
  productId: number;
  boughtTogetherProducts: RecommendationProductDto[];
}

export class PersonalizedRecommendationsResponseDto {
  userId?: number;
  recommendations: RecommendationProductDto[];
} 