import { CartItem } from './cart-item.model';
import { OrderItem } from './order-item.model';

export interface CreateOrderRequest {
    customerName: string;
    customerEmail: string;
    items: {
      productId: number;
      name: string;
      price: number;
      quantity: number;
      imageUrl: string;
    }[];
    totalAmount: number; // <-- only this, not totalPrice
    // ...other optional fields
  }