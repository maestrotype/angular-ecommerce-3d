import { LocalizedString } from '@shared/models/localized-string.model';
import { Product } from '@shared/models/product.model';
import { RecommendationProduct } from '../../app/core/services/recommendations.service';

/** Normalize recommendation DTO → storefront Product for app-product-card. */
export function toProductFromRecommendation(item: RecommendationProduct): Product {
  return {
    id: Number(item.id),
    name: item.name as string | LocalizedString,
    price: Number(item.price) || 0,
    imageUrl: item.imageUrl,
    category: item.category,
    rating: item.rating != null ? Number(item.rating) : undefined,
    discount: item.discount,
    isSpecial: item.isSpecial,
    isNew: item.isNew,
    originalPrice: item.originalPrice != null ? Number(item.originalPrice) : undefined,
    stock: item.stock,
    isFavorite: item.isFavorite,
    ratingCount: item.ratingCount,
    userRating: item.userRating,
  };
}
