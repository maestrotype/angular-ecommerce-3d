import { CartItem } from './cart-item.model';
import { OrderItem } from './order-item.model';

export interface CreateOrderRequest {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  notes?: string;
  items: {
    productId: number;
    name: string;
    price: number;
    quantity: number;
    imageUrl: string;
  }[];
  totalAmount: number;
  paymentMethod?: string;
}