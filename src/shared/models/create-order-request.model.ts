import { CartItem } from './cart-item.model';

export interface CreateOrderRequest {
  items: CartItem[];
  totalPrice: number;
  userId?: number;
  // + any fields that are needed to create an order (e.g. address, contacts)
}