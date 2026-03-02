import { Injectable, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Not, Between } from 'typeorm';
import { Observable, from, throwError, of } from 'rxjs';
import { map, catchError, switchMap, tap, filter } from 'rxjs/operators';
import { ProductRecommendation, RecommendationType } from './entities/product-recommendation.entity';
import { Product } from '../products/entities/product.entity';
import { Order } from '../orders/entities/order.entity';
import { RecommendationProductDto } from './dto/recommendation-response.dto';
import {
  ProductWithScore,
  ProductId,
  Category,
  PriceRange,
  UserPreferences,
  SimilarityWeights
} from './types/recommendation.types';
import {
  calculatePriceRange,
  calculateSimilarityScore,
  mapProductToDto,
  sortByScore,
  RECOMMENDATION_CONFIG,
  DEFAULT_SIMILARITY_WEIGHTS
} from './utils/recommendation.utils';
import {
  createRecommendationError,
  logRecommendationError,
  validateRecommendationParams,
  handleDatabaseError,
  handleAlgorithmError,
  handleInsufficientDataError,
  getUserFriendlyMessage
} from './utils/error.utils';
import { RecommendationErrorType } from './types/error.types';
import { extractString } from '../common/utils/localization.util';

@Injectable()
export class RecommendationsService {
  private readonly config = RECOMMENDATION_CONFIG;
  private readonly weights: SimilarityWeights = DEFAULT_SIMILARITY_WEIGHTS;

  constructor(
    @InjectRepository(ProductRecommendation)
    private readonly recommendationRepository: Repository<ProductRecommendation>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) { }

  /**
   * Get similar products based on category, price, rating, and features
   */
  getSimilarProducts(productId: ProductId, limit: number = this.config.defaultLimit): Observable<ProductWithScore[]> {
    console.log('Getting similar products for productId:', productId, 'limit:', limit);

    return from(this.productRepository.findOne({ where: { id: productId } })).pipe(
      switchMap(targetProduct => {
        if (!targetProduct) {
          console.log('Target product not found, returning popular products');
          return this.getPopularProducts(limit);
        }

        const productName = extractString(targetProduct.name);
        console.log('Target product found:', productName, 'category:', targetProduct.category);

        // Find products from the same category with similar price range
        const priceRange = Number(targetProduct.price) * 0.3; // 30% price range
        const minPrice = Number(targetProduct.price) - priceRange;
        const maxPrice = Number(targetProduct.price) + priceRange;

        console.log('Looking for similar products in category:', targetProduct.category, 'price range:', minPrice, '-', maxPrice);

        return from(this.productRepository.createQueryBuilder('product')
          .where('product.category = :category', { category: targetProduct.category })
          .andWhere('product.id != :productId', { productId })
          .andWhere('product.price BETWEEN :minPrice AND :maxPrice', { minPrice, maxPrice })
          .orderBy('product.rating', 'DESC')
          .addOrderBy('product.createdAt', 'DESC')
          .take(limit)
          .getMany()
        ).pipe(
          map(products => {
            console.log('Found', products.length, 'similar products in same category');
            return products.map(p => ({
              id: p.id,
              name: p.name,
              price: p.price,
              imageUrl: p.imageUrl,
              category: p.category,
              rating: p.rating,
              discount: p.discount,
              isSpecial: p.isSpecial,
              score: this.calculateSimilarityScore(targetProduct, p)
            }));
          }),
          switchMap(similarProducts => {
            // If we don't have enough similar products, fill with popular products from other categories
            if (similarProducts.length < limit) {
              const needed = limit - similarProducts.length;
              console.log('Need', needed, 'more products, adding popular products from other categories');

              return from(this.productRepository.find({
                where: {
                  category: Not(targetProduct.category), // Different category
                  id: Not(productId)
                },
                order: { rating: 'DESC' },
                take: needed
              })).pipe(
                map(additionalProducts => {
                  const additional = additionalProducts.map(p => ({
                    id: p.id,
                    name: p.name,
                    price: p.price,
                    imageUrl: p.imageUrl,
                    category: p.category,
                    rating: p.rating,
                    discount: p.discount,
                    isSpecial: p.isSpecial,
                    score: (p.rating || 0) * 0.5 // Lower score for different category
                  }));
                  return [...similarProducts, ...additional];
                })
              );
            }
            return of(similarProducts);
          })
        );
      }),
      tap(products => console.log('Returned', products.length, 'similar products')),
      catchError(error => {
        console.error('Error in getSimilarProducts:', error);
        return this.getPopularProducts(limit);
      })
    );
  }

  /**
   * Get products frequently bought together
   */
  getBoughtTogetherProducts(productId: ProductId, limit: number = this.config.defaultLimit): Observable<ProductWithScore[]> {
    console.log('Getting bought together products for productId:', productId, 'limit:', limit);

    return from(this.productRepository.findOne({ where: { id: productId } })).pipe(
      switchMap(targetProduct => {
        if (!targetProduct) {
          console.log('Target product not found, returning popular products');
          return this.getPopularProducts(limit);
        }

        const productName = extractString(targetProduct.name);
        console.log('Target product found:', productName, 'category:', targetProduct.category);

        // For "bought together", we want products from DIFFERENT categories
        // This simulates complementary products that customers buy together
        return from(this.productRepository.find({
          where: {
            category: Not(targetProduct.category), // Different category is key for "bought together"
            id: Not(productId) // Exclude current product
          },
          order: { rating: 'DESC', isSpecial: 'DESC' }, // Prefer highly rated and special products
          take: limit
        })).pipe(
          map(products => {
            console.log('Found', products.length, 'complementary products from different categories');
            return products.map(p => ({
              id: p.id,
              name: p.name,
              price: p.price,
              imageUrl: p.imageUrl,
              category: p.category,
              rating: p.rating,
              discount: p.discount,
              isSpecial: p.isSpecial,
              score: this.calculateComplementaryScore(targetProduct, p)
            }));
          }),
          switchMap(complementaryProducts => {
            // If we don't have enough from different categories, add some popular products
            if (complementaryProducts.length < limit) {
              const needed = limit - complementaryProducts.length;
              console.log('Need', needed, 'more products, adding popular products');

              return from(this.productRepository.find({
                where: {
                  id: Not(productId)
                },
                order: { rating: 'DESC' },
                take: needed
              })).pipe(
                map(additionalProducts => {
                  const additional = additionalProducts
                    .filter(p => !complementaryProducts.some(cp => cp.id === p.id)) // Avoid duplicates
                    .map(p => ({
                      id: p.id,
                      name: p.name,
                      price: p.price,
                      imageUrl: p.imageUrl,
                      category: p.category,
                      rating: p.rating,
                      discount: p.discount,
                      isSpecial: p.isSpecial,
                      score: (p.rating || 0) * 0.3 // Lower score for fallback
                    }));
                  return [...complementaryProducts, ...additional];
                })
              );
            }
            return of(complementaryProducts);
          })
        );
      }),
      tap(products => console.log('Returned', products.length, 'bought together products')),
      catchError(error => {
        console.error('Error in getBoughtTogetherProducts:', error);
        return this.getPopularProducts(limit);
      })
    );
  }

  /**
   * Get personalized recommendations based on user preferences
   */
  getPersonalizedRecommendations(userId?: number, limit: number = this.config.maxPersonalizedLimit): Observable<ProductWithScore[]> {
    if (!userId) {
      return this.getPopularProducts(limit).pipe(
        this.handleRecommendationError('Failed to get popular products', 'popular_products')
      );
    }

    return this.getUserPreferences(userId).pipe(
      switchMap(preferences => this.findProductsByPreferences(preferences, limit)),
      map(products => this.calculatePersonalizedScores(products)),
      this.handleRecommendationError('Failed to get personalized recommendations', 'personalized')
    );
  }

  /**
   * Update all recommendations in the system
   */
  updateRecommendations(): Observable<{ message: string; updatedCount: number }> {
    return from(this.productRepository.find()).pipe(
      switchMap(products => this.generateAllRecommendations(products)),
      map(recommendations => ({
        message: 'Recommendations updated successfully',
        updatedCount: recommendations.length
      })),
      this.handleRecommendationError('Failed to update recommendations', 'update_recommendations')
    );
  }

  // Private utility methods

  private findProductById(productId: ProductId): Observable<Product> {
    return from(this.productRepository.findOne({ where: { id: productId } })).pipe(
      switchMap(product => {
        if (!product) {
          const error = createRecommendationError(
            RecommendationErrorType.PRODUCT_NOT_FOUND,
            `Product with ID ${productId} not found`,
            { productId }
          );
          logRecommendationError(error);
          return throwError(() => new HttpException(
            getUserFriendlyMessage(error),
            HttpStatus.NOT_FOUND
          ));
        }
        return of(product);
      }),
      catchError(error => {
        if (error instanceof HttpException) {
          return throwError(() => error);
        }
        const dbError = handleDatabaseError(error, 'find_product_by_id');
        logRecommendationError(dbError);
        return throwError(() => new HttpException(
          getUserFriendlyMessage(dbError),
          HttpStatus.INTERNAL_SERVER_ERROR
        ));
      })
    );
  }

  private findSimilarProducts(product: Product, limit: number): Observable<{ targetProduct: Product; products: Product[] }> {
    const priceRange = calculatePriceRange(product.price, this.config.priceRangePercentage);

    return from(this.productRepository
      .createQueryBuilder('p')
      .where('p.category = :category', { category: product.category })
      .andWhere('p.id != :productId', { productId: product.id })
      .andWhere('p.price BETWEEN :minPrice AND :maxPrice', {
        minPrice: priceRange.min,
        maxPrice: priceRange.max
      })
      .orderBy('p.rating', 'DESC')
      .addOrderBy('p.createdAt', 'DESC')
      .limit(limit)
      .getMany()
    ).pipe(
      map(products => ({ targetProduct: product, products })),
      catchError(error => {
        const dbError = handleDatabaseError(error, 'find_similar_products');
        logRecommendationError(dbError);
        return throwError(() => new HttpException(
          getUserFriendlyMessage(dbError),
          HttpStatus.INTERNAL_SERVER_ERROR
        ));
      })
    );
  }

  private findOrdersWithProduct(productId: ProductId): Observable<Order[]> {
    return from(this.orderRepository.find()).pipe(
      map(orders => orders.filter(order =>
        order.items.some(item => item.productId === productId)
      )),
      catchError(error => {
        const dbError = handleDatabaseError(error, 'find_orders_with_product');
        logRecommendationError(dbError);
        return throwError(() => new HttpException(
          getUserFriendlyMessage(dbError),
          HttpStatus.INTERNAL_SERVER_ERROR
        ));
      })
    );
  }

  private extractBoughtTogetherProducts(orders: Order[], targetProductId: ProductId): ProductId[] {
    try {
      const boughtTogetherMap = new Map<ProductId, number>();

      orders.forEach(order => {
        const hasTargetProduct = order.items.some(item => item.productId === targetProductId);
        if (hasTargetProduct) {
          order.items.forEach(item => {
            if (item.productId !== targetProductId) {
              boughtTogetherMap.set(
                item.productId,
                (boughtTogetherMap.get(item.productId) || 0) + item.quantity
              );
            }
          });
        }
      });

      const result = Array.from(boughtTogetherMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, this.config.defaultLimit)
        .map(([productId]) => productId);

      // Check if we have enough data
      if (result.length === 0) {
        const error = handleInsufficientDataError('bought together products', 1, 0);
        logRecommendationError(error);
        throw new HttpException(
          getUserFriendlyMessage(error),
          HttpStatus.UNPROCESSABLE_ENTITY
        );
      }

      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      const algorithmError = handleAlgorithmError(error, 'extract_bought_together');
      logRecommendationError(algorithmError);
      throw new HttpException(
        getUserFriendlyMessage(algorithmError),
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  private findProductsByIds(productIds: ProductId[], limit: number): Observable<Product[]> {
    if (productIds.length === 0) {
      return of([]);
    }

    return from(this.productRepository.find({
      where: { id: In(productIds) },
      take: limit
    })).pipe(
      catchError(error => {
        const dbError = handleDatabaseError(error, 'find_products_by_ids');
        logRecommendationError(dbError);
        return throwError(() => new HttpException(
          getUserFriendlyMessage(dbError),
          HttpStatus.INTERNAL_SERVER_ERROR
        ));
      })
    );
  }

  private getUserPreferences(userId: number): Observable<UserPreferences> {
    return from(this.orderRepository.find({
      order: { createdAt: 'DESC' }
    })).pipe(
      map(orders => this.calculateUserPreferences(orders)),
      catchError(error => {
        const dbError = handleDatabaseError(error, 'get_user_preferences');
        logRecommendationError(dbError);
        return throwError(() => new HttpException(
          getUserFriendlyMessage(dbError),
          HttpStatus.INTERNAL_SERVER_ERROR
        ));
      })
    );
  }

  private calculateUserPreferences(orders: Order[]): UserPreferences {
    try {
      const categoryPreferences = new Map<Category, number>();
      const pricePreferences = new Map<number, number>();

      orders.forEach(order => {
        order.items.forEach(item => {
          // Category preferences - using a default category since it's not in the item
          const category = 'general';
          categoryPreferences.set(category, (categoryPreferences.get(category) || 0) + item.quantity);

          // Price preferences (grouped by $50 ranges)
          const priceRange = Math.floor(item.price / 50) * 50;
          pricePreferences.set(priceRange, (pricePreferences.get(priceRange) || 0) + item.quantity);
        });
      });

      return { categoryPreferences, pricePreferences };
    } catch (error) {
      const algorithmError = handleAlgorithmError(error, 'calculate_user_preferences');
      logRecommendationError(algorithmError);
      throw new HttpException(
        getUserFriendlyMessage(algorithmError),
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  private findProductsByPreferences(preferences: UserPreferences, limit: number): Observable<Product[]> {
    const preferredCategories = Array.from(preferences.categoryPreferences.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category]) => category);

    const preferredPriceRanges = Array.from(preferences.pricePreferences.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([range]) => range);

    if (preferredCategories.length === 0) {
      return from(this.productRepository.find({
        order: { rating: 'DESC' },
        take: limit
      })).pipe(
        catchError(error => {
          const dbError = handleDatabaseError(error, 'find_products_by_preferences');
          logRecommendationError(dbError);
          return throwError(() => new HttpException(
            getUserFriendlyMessage(dbError),
            HttpStatus.INTERNAL_SERVER_ERROR
          ));
        })
      );
    }

    return from(this.productRepository
      .createQueryBuilder('p')
      .where('p.category IN (:...categories)', { categories: preferredCategories })
      .andWhere('FLOOR(p.price / 50) * 50 IN (:...priceRanges)', { priceRanges: preferredPriceRanges })
      .orderBy('p.rating', 'DESC')
      .addOrderBy('p.createdAt', 'DESC')
      .limit(limit)
      .getMany()
    ).pipe(
      catchError(error => {
        const dbError = handleDatabaseError(error, 'find_products_by_preferences');
        logRecommendationError(dbError);
        return throwError(() => new HttpException(
          getUserFriendlyMessage(dbError),
          HttpStatus.INTERNAL_SERVER_ERROR
        ));
      })
    );
  }

  private getPopularProducts(limit: number): Observable<ProductWithScore[]> {
    console.log('Getting popular products, limit:', limit);

    return from(this.productRepository.find({
      order: { rating: 'DESC' },
      take: limit
    })).pipe(
      tap(products => console.log('Found popular products from DB:', products.length)),
      map(products => products.map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        imageUrl: p.imageUrl,
        category: p.category,
        rating: p.rating,
        discount: p.discount,
        isSpecial: p.isSpecial,
        score: p.rating || 0
      }))),
      tap(dtos => console.log('Mapped popular products to DTOs:', dtos.length)),
      catchError(error => {
        console.error('Error in getPopularProducts:', error);
        // Return empty array instead of mock data to avoid navigation issues
        return of([]);
      })
    );
  }

  private calculateSimilarityScores(targetProduct: Product, products: Product[]): ProductWithScore[] {
    try {
      return sortByScore(products.map(product => ({
        ...mapProductToDto(product),
        score: calculateSimilarityScore(targetProduct, product, this.weights)
      })));
    } catch (error) {
      const algorithmError = handleAlgorithmError(error, 'calculate_similarity_scores');
      logRecommendationError(algorithmError);
      throw new HttpException(
        getUserFriendlyMessage(algorithmError),
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  private calculateBoughtTogetherScores(products: Product[], targetProductId: ProductId): ProductWithScore[] {
    try {
      return products.map(product => ({
        ...mapProductToDto(product),
        score: this.getBoughtTogetherFrequency(product.id, targetProductId)
      }));
    } catch (error) {
      const algorithmError = handleAlgorithmError(error, 'calculate_bought_together_scores');
      logRecommendationError(algorithmError);
      throw new HttpException(
        getUserFriendlyMessage(algorithmError),
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  private calculatePersonalizedScores(products: Product[]): ProductWithScore[] {
    try {
      return products.map(product => ({
        ...mapProductToDto(product),
        score: product.rating || 0
      }));
    } catch (error) {
      const algorithmError = handleAlgorithmError(error, 'calculate_personalized_scores');
      logRecommendationError(algorithmError);
      throw new HttpException(
        getUserFriendlyMessage(algorithmError),
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  private generateAllRecommendations(products: Product[]): Observable<ProductRecommendation[]> {
    try {
      const recommendations: ProductRecommendation[] = [];

      products.forEach(product => {
        const similarProducts = products.filter(p =>
          p.id !== product.id &&
          p.category === product.category &&
          Math.abs(p.price - product.price) <= product.price * this.config.priceRangePercentage
        ).slice(0, 5);

        similarProducts.forEach(similarProduct => {
          recommendations.push(
            this.recommendationRepository.create({
              productId: product.id,
              recommendedProductId: similarProduct.id,
              type: RecommendationType.SIMILAR,
              score: calculateSimilarityScore(product, similarProduct, this.weights)
            })
          );
        });
      });

      return from(this.recommendationRepository.clear()).pipe(
        switchMap(() => from(this.recommendationRepository.save(recommendations)))
      );
    } catch (error) {
      const algorithmError = handleAlgorithmError(error, 'generate_all_recommendations');
      logRecommendationError(algorithmError);
      return throwError(() => new HttpException(
        getUserFriendlyMessage(algorithmError),
        HttpStatus.INTERNAL_SERVER_ERROR
      ));
    }
  }

  private getBoughtTogetherFrequency(productId: ProductId, targetProductId: ProductId): number {
    // This would be calculated from actual order data
    // For now, return a random score for demonstration
    return Math.floor(Math.random() * 10) + 1;
  }

  private handleRecommendationError<T>(message: string, context: string) {
    return (source: Observable<T>): Observable<T> =>
      source.pipe(
        catchError(error => {
          if (error instanceof HttpException) {
            return throwError(() => error);
          }

          const recommendationError = createRecommendationError(
            RecommendationErrorType.ALGORITHM_ERROR,
            `${message}: ${error.message}`,
            { context, originalError: error.message }
          );

          logRecommendationError(recommendationError);
          return throwError(() => new HttpException(
            getUserFriendlyMessage(recommendationError),
            HttpStatus.INTERNAL_SERVER_ERROR
          ));
        })
      );
  }

  private mapProductToDto(product: Product, score: number = 0): ProductWithScore {
    const dto = {
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

    console.log('Mapped product to DTO:', dto);
    return dto;
  }

  /**
   * Calculate similarity score between two products
   */
  private calculateSimilarityScore(targetProduct: Product, candidateProduct: Product): number {
    let score = 0;

    // Same category gets high score
    if (targetProduct.category === candidateProduct.category) {
      score += 50;
    }

    // Similar price range gets points
    const targetPrice = Number(targetProduct.price);
    const candidatePrice = Number(candidateProduct.price);
    const priceDiff = Math.abs(targetPrice - candidatePrice);
    const priceRange = targetPrice * 0.3; // 30% range

    if (priceDiff <= priceRange) {
      score += 30;
    } else if (priceDiff <= priceRange * 2) {
      score += 15;
    }

    // Rating bonus
    if (candidateProduct.rating) {
      score += candidateProduct.rating * 2;
    }

    // Special product bonus
    if (candidateProduct.isSpecial) {
      score += 10;
    }

    return Math.min(score, 100); // Cap at 100
  }

  /**
   * Calculate complementary score for "bought together" products
   */
  private calculateComplementaryScore(targetProduct: Product, candidateProduct: Product): number {
    let score = 0;

    // Different category is preferred for complementary products
    if (targetProduct.category !== candidateProduct.category) {
      score += 40;
    }

    // Rating is important for complementary products
    if (candidateProduct.rating) {
      score += candidateProduct.rating * 3;
    }

    // Special products are more likely to be bought together
    if (candidateProduct.isSpecial) {
      score += 20;
    }

    // Price complementarity - not too expensive compared to main product
    const targetPrice = Number(targetProduct.price);
    const candidatePrice = Number(candidateProduct.price);

    if (candidatePrice <= targetPrice * 0.5) {
      score += 20; // Cheaper complementary products are good
    } else if (candidatePrice <= targetPrice) {
      score += 10;
    }

    return Math.min(score, 100); // Cap at 100
  }
} 