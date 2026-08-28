import { CartItem } from './cart-item.model';

/** Storefront / checkout order shape */
export interface Order {
  id?: number;
  items: CartItem[];
  totalPrice: number;
  totalAmount: number;
  userId?: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** Admin order line item */
export interface OrderItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

/** Admin panel order detail */
export interface AdminOrder {
  id: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  shippingAddress?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  paymentMethod?: string;
  notes?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}
