
import { LocalizedString } from '../../shared/models/localized-string.model';

export interface Product {
  id: number;
  name: string | LocalizedString;
  category: string;
  price: number;
  discount?: number;
  isSpecial?: boolean;
  rating?: number;
  description: string | LocalizedString;
  features?: string[];
  specifications: { [key: string]: string };
  images?: string[];
  imageUrl: string;
  model3dUrl?: string;
  localModel3dUrl?: string;
  model3dPublicId?: string;
  hdModelPath?: string;
  stock?: number;
  createdAt?: Date;
  updatedAt?: Date;
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
