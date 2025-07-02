export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  discount?: number;
  isSpecial?: boolean;
  rating?: number;
  description: string;
  features?: string[];
  specifications: { [key: string]: string };
  images?: string[];
  imageUrl: string;
  stock?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
