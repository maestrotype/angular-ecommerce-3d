import { LocalizedString } from '@shared/models/localized-string.model';

export interface CartItem {
  productId: number;
  name: string | LocalizedString;
  price: number;
  quantity: number;
  imageUrl: string;
  discount?: number;
  features?: string[];
  specifications?: { [key: string]: string };
}