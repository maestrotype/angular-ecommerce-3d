import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProductService } from './product.service';
import { environment } from '../../../environments/environment';

describe('ProductService', () => {
    let service: ProductService;
    let httpMock: HttpTestingController;
    const apiUrl = environment.apiUrl;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [ProductService]
        });
        service = TestBed.inject(ProductService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should fetch products', () => {
        const mockProducts = [{ id: 1, name: 'P1' }, { id: 2, name: 'P2' }];

        service.getProducts().subscribe(products => {
            expect(products.length).toBe(2);
            expect(products).toEqual(mockProducts);
        });

        const req = httpMock.expectOne(`${apiUrl}/products`);
        expect(req.request.method).toBe('GET');
        req.flush(mockProducts);
    });

    it('should search products with encoding', () => {
        const searchTerm = 'blue bag';
        service.searchProducts(searchTerm).subscribe();

        const encodedTerm = encodeURIComponent(searchTerm);
        const req = httpMock.expectOne(`${apiUrl}/products?search=${encodedTerm}`);
        expect(req.request.method).toBe('GET');
        req.flush([]);
    });
});
