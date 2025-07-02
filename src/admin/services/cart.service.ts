
export interface CartItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
    image: string;
    originalPrice?: number;
    discount?: number;
  }
  
  class CartServiceImpl {
    private static instance: CartServiceImpl;
    private cartItems: CartItem[] = [];
    private subscribers: ((items: CartItem[]) => void)[] = [];
  
    private constructor() {
      this.loadCartFromStorage();
    }
  
    static getInstance(): CartServiceImpl {
      if (!CartServiceImpl.instance) {
        CartServiceImpl.instance = new CartServiceImpl();
      }
      return CartServiceImpl.instance;
    }
  
    subscribe(callback: (items: CartItem[]) => void): () => void {
      this.subscribers.push(callback);
      return () => {
        const index = this.subscribers.indexOf(callback);
        if (index > -1) {
          this.subscribers.splice(index, 1);
        }
      };
    }
  
    private notify(): void {
      this.subscribers.forEach(callback => callback([...this.cartItems]));
    }
  
    addToCart(item: Omit<CartItem, 'quantity'>): void {
      const existingItem = this.cartItems.find(cartItem => cartItem.id === item.id);
      
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        this.cartItems.push({ ...item, quantity: 1 });
      }
      
      this.updateCart();
    }
  
    removeFromCart(itemId: number): void {
      this.cartItems = this.cartItems.filter(item => item.id !== itemId);
      this.updateCart();
    }
  
    updateQuantity(itemId: number, quantity: number): void {
      const item = this.cartItems.find(cartItem => cartItem.id === itemId);
      
      if (item) {
        if (quantity <= 0) {
          this.removeFromCart(itemId);
        } else {
          item.quantity = quantity;
          this.updateCart();
        }
      }
    }
  
    getCartItems(): CartItem[] {
      return [...this.cartItems];
    }
  
    getTotalPrice(): number {
      return this.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    }
  
    getTotalCount(): number {
      return this.cartItems.reduce((total, item) => total + item.quantity, 0);
    }
  
    clearCart(): void {
      this.cartItems = [];
      this.updateCart();
    }
  
    private updateCart(): void {
      this.saveCartToStorage();
      this.notify();
    }
  
    private saveCartToStorage(): void {
      localStorage.setItem('cart', JSON.stringify(this.cartItems));
    }
  
    private loadCartFromStorage(): void {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        try {
          this.cartItems = JSON.parse(savedCart) as CartItem[];
        } catch (error) {
          console.error('Error loading cart from storage:', error);
        }
      }
    }
  }
  
  export const CartService = CartServiceImpl;
  