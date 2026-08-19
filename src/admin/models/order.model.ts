export interface OrderItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface Order {
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
