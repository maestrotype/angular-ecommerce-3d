export interface OrderItem {
    productId: number;
    name: string;
    price: number;
    quantity: number;
    image: string;
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
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
  }