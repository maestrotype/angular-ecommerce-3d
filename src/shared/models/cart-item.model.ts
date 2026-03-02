import { Localizable } from './localization.model';

export interface CartItem {
  productId: number;
  name: Localizable;
  price: number;
  quantity: number;
  imageUrl: string;
  discount?: number;
  features?: string[];
  specifications?: { [key: string]: string };
}