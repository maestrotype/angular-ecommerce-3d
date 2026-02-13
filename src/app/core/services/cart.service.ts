
import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable, forkJoin, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Order } from 'src/shared/models/order.model';
import { CreateOrderRequest } from 'src/shared/models/create-order-request.model';
import { CartItem } from 'src/shared/models/cart-item.model';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  public cartItems$ = this.cartItemsSubject.asObservable();
  private apiUrl = environment.apiUrl + '/orders';
  private productsApiUrl = environment.apiUrl + '/products';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Load cart from localStorage on service initialization (browser only)
    this.loadCartFromStorage();
  }

  addToCart(item: Omit<CartItem, 'quantity'>): void {
    // Ensure price is a number
    const validatedItem = {
      ...item,
      price: Number(item.price),
      productId: Number(item.productId),
      quantity: 1
    };


    const currentItems = this.cartItemsSubject.value;
    const existingItem = currentItems.find(cartItem => cartItem.productId === validatedItem.productId);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      currentItems.push(validatedItem);
    }

    this.updateCart(currentItems);
  }

  removeFromCart(itemId: number): void {
    const currentItems = this.cartItemsSubject.value;
    const updatedItems = currentItems.filter(item => item.productId !== itemId);
    this.updateCart(updatedItems);
  }

  updateQuantity(itemId: number, quantity: number): void {
    const currentItems = this.cartItemsSubject.value;
    const item = currentItems.find(cartItem => cartItem.productId === itemId);

    if (item) {
      if (quantity <= 0) {
        this.removeFromCart(itemId);
      } else {
        item.quantity = quantity;
        this.updateCart(currentItems);
      }
    }
  }

  getCartItems(): Observable<CartItem[]> {
    return this.cartItems$;
  }

  getTotalPrice(): Observable<number> {
    return this.cartItems$.pipe(
      map(items => items.reduce((total, item) => total + (item.price * item.quantity), 0))
    );
  }

  getTotalCount(): Observable<number> {
    return this.cartItems$.pipe(
      map(items => items.reduce((total, item) => total + item.quantity, 0))
    );
  }

  clearCart(): void {
    this.updateCart([]);
  }

  createOrder(orderData: CreateOrderRequest): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, orderData);
  }

  private updateCart(items: CartItem[]): void {
    // Validate and convert types for all items
    const validatedItems = items.map(item => ({
      ...item,
      productId: Number(item.productId),
      price: Number(item.price),
      quantity: Number(item.quantity)
    }));

    this.cartItemsSubject.next(validatedItems);
    this.saveCartToStorage(validatedItems);
  }

  private saveCartToStorage(items: CartItem[]): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('cart', JSON.stringify(items));
    }
  }

  private loadCartFromStorage(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return; // Skip on server-side
    }

    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const items = JSON.parse(savedCart) as CartItem[];

        // Validate and convert types for loaded items
        const validatedItems = items.map(item => ({
          ...item,
          productId: Number(item.productId),
          price: Number(item.price),
          quantity: Number(item.quantity)
        }));

        // Check stock availability for all items
        this.validateCartItemsStock(validatedItems);
      } catch (error) {

      }
    }
  }

  private validateCartItemsStock(items: CartItem[]): void {
    if (items.length === 0) {
      this.cartItemsSubject.next([]);
      return;
    }

    // Check stock for each item
    const stockChecks = items.map(item =>
      this.http.get<any>(`${this.productsApiUrl}/${item.productId}`).pipe(
        map(product => ({ item, product, hasStock: product.stock >= item.quantity })),
        catchError(() => of({ item, product: null, hasStock: false }))
      )
    );

    forkJoin(stockChecks).subscribe(results => {
      // Keep only items with sufficient stock
      const validItems = results
        .filter(result => result.hasStock)
        .map(result => result.item);

      // Update cart with valid items only
      this.cartItemsSubject.next(validItems);
      this.saveCartToStorage(validItems);

      // Remove invalid items from localStorage
      if (validItems.length !== items.length) {

      }
    });
  }
}
