import { LocalizedString } from '@shared/models/localized-string.model';

export interface Product {
  id: number;
  name: string | LocalizedString;
  price: number;
  imageUrl: string;
  category?: string;
  discount?: number;
  originalPrice?: number;
  isSpecial?: boolean;
  isNew?: boolean;
  rating?: number;
  ratingCount?: number;
  userRating?: number;
  description?: string | LocalizedString;
  images?: string[];
  model3dUrl?: string;
  localModel3dUrl?: string;
  model3dPublicId?: string;
  hdModelPath?: string;
  features?: string[];
  stock?: number;
  specifications?: { [key: string]: string };
  isFavorite?: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface ProductCreateRequest {
  name: string | LocalizedString;
  category: string;
  price: number;
  description: string | LocalizedString;
  stock: number;
  imageUrl?: string;
  specifications?: { [key: string]: string };
}

export interface ProductUpdateRequest extends Partial<ProductCreateRequest> {
  id: number;
}
