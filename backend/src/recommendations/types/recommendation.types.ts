// Core recommendation types
import { Localizable } from '../../common/interfaces/localization.interface';
export type ProductId = number;
export type Category = string;
export type Score = number;

// Price and range types
export type PriceRange = { min: number; max: number };
export type PriceRangeGroup = number; // Grouped by $50 ranges

// User preference types
export type UserPreferences = {
  categoryPreferences: Map<Category, number>;
  pricePreferences: Map<PriceRangeGroup, number>;
};

// Recommendation algorithm weights
export type SimilarityWeights = {
  category: number;
  price: number;
  rating: number;
  features: number;
};

// Service configuration
export type RecommendationConfig = {
  defaultLimit: number;
  maxPersonalizedLimit: number;
  priceRangePercentage: number;
  similarityWeights: SimilarityWeights;
};

// Response types
export type RecommendationResult<T> = {
  success: boolean;
  data: T;
  error?: string;
};

// Product with recommendation score
export type ProductWithScore = {
  id: ProductId;
  name: Localizable;
  price: number;
  imageUrl: string;
  category: Category;
  rating?: number;
  discount?: number;
  isSpecial?: boolean;
  score: Score;
};

// Similar products response
export type SimilarProductsResponse = {
  productId: ProductId;
  similarProducts: ProductWithScore[];
};

// Bought together response
export type BoughtTogetherResponse = {
  productId: ProductId;
  boughtTogetherProducts: ProductWithScore[];
};

// Personalized recommendations response
export type PersonalizedRecommendationsResponse = {
  userId?: number;
  recommendations: ProductWithScore[];
};

// Update recommendations response
export type UpdateRecommendationsResponse = {
  message: string;
  updatedCount: number;
}; 