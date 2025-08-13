import { Product } from '../../products/entities/product.entity';
import { ProductWithScore, PriceRange, SimilarityWeights, Category } from '../types/recommendation.types';

/**
 * Default similarity weights for recommendation algorithms
 */
export const DEFAULT_SIMILARITY_WEIGHTS: SimilarityWeights = {
  category: 0.4,
  price: 0.3,
  rating: 0.2,
  features: 0.1
} as const;

/**
 * Default recommendation configuration
 */
export const RECOMMENDATION_CONFIG = {
  defaultLimit: 4,
  maxPersonalizedLimit: 8,
  priceRangePercentage: 0.3,
  similarityWeights: DEFAULT_SIMILARITY_WEIGHTS
} as const;

/**
 * Calculate price range for similar products
 */
export function calculatePriceRange(price: number, percentage: number = RECOMMENDATION_CONFIG.priceRangePercentage): PriceRange {
  const range = price * percentage;
  return {
    min: Math.max(0, price - range),
    max: price + range
  };
}

/**
 * Calculate similarity score between two products
 */
export function calculateSimilarityScore(
  product1: Product, 
  product2: Product, 
  weights: SimilarityWeights = DEFAULT_SIMILARITY_WEIGHTS
): number {
  let score = 0;
  
  // Category similarity
  if (product1.category === product2.category) {
    score += weights.category;
  }
  
  // Price similarity
  const priceDiff = Math.abs(product1.price - product2.price) / Math.max(product1.price, product2.price);
  score += (1 - priceDiff) * weights.price;
  
  // Rating similarity
  if (product1.rating && product2.rating) {
    const ratingDiff = Math.abs(product1.rating - product2.rating) / 5;
    score += (1 - ratingDiff) * weights.rating;
  }
  
  // Feature similarity
  if (product1.features && product2.features && product1.features.length > 0 && product2.features.length > 0) {
    const commonFeatures = product1.features.filter(f => product2.features.includes(f));
    const featureSimilarity = commonFeatures.length / Math.max(product1.features.length, product2.features.length);
    score += featureSimilarity * weights.features;
  }
  
  return Math.round(score * 100) / 100;
}

/**
 * Map Product entity to ProductWithScore DTO
 */
export function mapProductToDto(product: Product, score: number = 0): ProductWithScore {
  return {
    id: product.id,
    name: product.name,
    price: product.price,
    imageUrl: product.imageUrl,
    category: product.category,
    rating: product.rating,
    discount: product.discount,
    isSpecial: product.isSpecial,
    score
  };
}

/**
 * Sort products by score in descending order
 */
export function sortByScore(products: ProductWithScore[]): ProductWithScore[] {
  return [...products].sort((a, b) => b.score - a.score);
}

/**
 * Group products by category
 */
export function groupByCategory(products: Product[]): Map<Category, Product[]> {
  return products.reduce((groups, product) => {
    const category = product.category;
    if (!groups.has(category)) {
      groups.set(category, []);
    }
    groups.get(category)!.push(product);
    return groups;
  }, new Map<Category, Product[]>());
}

/**
 * Calculate price range group (grouped by $50 ranges)
 */
export function calculatePriceRangeGroup(price: number): number {
  return Math.floor(price / 50) * 50;
}

/**
 * Validate recommendation parameters
 */
export function validateRecommendationParams(productId: number, limit: number): boolean {
  return productId > 0 && limit > 0 && limit <= 20;
}

/**
 * Generate cache key for recommendations
 */
export function generateCacheKey(type: string, productId: number, limit: number): string {
  return `${type}_${productId}_${limit}`;
}

/**
 * Calculate average rating from products
 */
export function calculateAverageRating(products: Product[]): number {
  if (products.length === 0) return 0;
  
  const totalRating = products.reduce((sum, product) => sum + (product.rating || 0), 0);
  return Math.round((totalRating / products.length) * 10) / 10;
}

/**
 * Filter products by price range
 */
export function filterByPriceRange(products: Product[], minPrice: number, maxPrice: number): Product[] {
  return products.filter(product => product.price >= minPrice && product.price <= maxPrice);
}

/**
 * Get top rated products
 */
export function getTopRatedProducts(products: Product[], limit: number): Product[] {
  return products
    .filter(product => product.rating !== null && product.rating !== undefined)
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, limit);
} 