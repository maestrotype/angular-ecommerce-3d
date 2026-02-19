import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PLATFORM_ID } from '@angular/core';
import { CartService } from './cart.service';
import { CartItem } from 'src/shared/models/cart-item.model';

describe('CartService', () => {
    let service: CartService;
    let httpMock: HttpTestingController;

    const mockItem: Omit<CartItem, 'quantity'> = {
        productId: 1,
        name: 'Test Product',
        price: 100,
        imageUrl: 'test.jpg'
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                CartService,
                { provide: PLATFORM_ID, useValue: 'browser' }
            ]
        });

        // Clear localStorage
        localStorage.clear();

        service = TestBed.inject(CartService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    it('should add item to cart', (done) => {
        service.addToCart(mockItem);
        service.cartItems$.subscribe(items => {
            expect(items.length).toBe(1);
            expect(items[0].productId).toBe(1);
            expect(items[0].quantity).toBe(1);
            done();
        });
    });

    it('should increment quantity if same item added twice', (done) => {
        service.addToCart(mockItem);
        service.addToCart(mockItem);
        service.cartItems$.subscribe(items => {
            expect(items.length).toBe(1);
            expect(items[0].quantity).toBe(2);
            done();
        });
    });

    it('should remove item from cart', (done) => {
        service.addToCart(mockItem);
        service.removeFromCart(1);
        service.cartItems$.subscribe(items => {
            expect(items.length).toBe(0);
            done();
        });
    });

    it('should calculate total price correctly', (done) => {
        service.addToCart(mockItem); // 100
        service.addToCart({ ...mockItem, productId: 2, price: 50 }); // 50
        service.updateQuantity(1, 2); // 100 * 2 = 200

        service.getTotalPrice().subscribe(total => {
            expect(total).toBe(250);
            done();
        });
    });

    it('should clear cart', (done) => {
        service.addToCart(mockItem);
        service.clearCart();
        service.cartItems$.subscribe(items => {
            expect(items.length).toBe(0);
            done();
        });
    });
});
