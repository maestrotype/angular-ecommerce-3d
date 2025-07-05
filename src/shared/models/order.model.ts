import { CartItem } from './cart-item.model';

export interface Order {
  id?: number;
  items: CartItem[];
  totalPrice: number;
  userId?: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}