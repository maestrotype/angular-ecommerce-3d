export interface Product {
    id: number;
    name: string;
    price: number;
    imageUrl: string;
    category?: string; // optional(Shoes, Handbags, Clothing)
    discount?: number;
    isSpecial?: boolean; // flag for "Special Offer"
  }