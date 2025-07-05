export interface CartItem {
    productId: number;
    name: string;
    price: number;
    quantity: number;
    imageUrl: string;
    discount?: number;
    features?: string[];
    specifications?: { [key: string]: string };
  }