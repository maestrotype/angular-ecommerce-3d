import { LocalizedString } from '@shared/models/localized-string.model';

export interface Product {
  id: number;
  name: string | LocalizedString;
  price: number;
  imageUrl: string;
  category?: string; // optional(Shoes, Handbags, Clothing)
  discount?: number;
  originalPrice?: number; // original price before discount
  isSpecial?: boolean; // flag for "Special Offer"
  isNew?: boolean; // flag for "NEW" badge
  rating?: number; // average rating (0-5)
  ratingCount?: number; // number of reviews
  userRating?: number; // current user's rating (0-5)
  description?: string | LocalizedString;
  images?: string[];
  model3dUrl?: string;
  features?: string[];
  stock?: number;
  specifications?: { [key: string]: string };
  isFavorite?: boolean; // track if product is in user's favorites
}