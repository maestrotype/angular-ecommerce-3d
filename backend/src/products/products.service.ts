
import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { MoreThan, Like } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Observable, from, throwError, of } from 'rxjs';
import { map, catchError, switchMap, tap } from 'rxjs/operators';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { extractString } from '../common/utils/localization.util';

@Injectable()
export class ProductsService {
  private readonly LOW_STOCK_THRESHOLD = 10;
  private lowStockNotified = new Set<number>(); // Track products we've already notified about

  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private notificationsService: NotificationsService,
  ) { }

  create(createProductDto: CreateProductDto): Observable<Product> {
    const product = this.productRepository.create(createProductDto);

    return from(this.productRepository.save(product)).pipe(
      switchMap(savedProduct =>
        this.checkAndNotifyLowStock(savedProduct).pipe(
          map(() => savedProduct)
        )
      ),
      catchError(error => throwError(() => new InternalServerErrorException(`Failed to create product: ${error.message}`)))
    );
  }

  findAll(): Observable<Product[]> {
    return from(this.productRepository.find({
      order: { createdAt: 'DESC' },
    })).pipe(
      catchError(error => throwError(() => new InternalServerErrorException(`Failed to get products: ${error.message}`)))
    );
  }

  findAvailable(): Observable<Product[]> {
    return from(this.productRepository.find({
      where: { stock: MoreThan(0) },
      order: { createdAt: 'DESC' },
    })).pipe(
      catchError(error => throwError(() => new InternalServerErrorException(`Failed to get products: ${error.message}`)))
    );
  }

  findOne(id: number): Observable<Product> {
    return from(this.productRepository.findOne({ where: { id } })).pipe(
      map(product => {
        if (!product) {
          throw new NotFoundException(`Product with ID ${id} not found`);
        }
        return product;
      }),
      catchError(error => {
        if (error instanceof NotFoundException) {
          return throwError(() => error);
        }
        return throwError(() => new InternalServerErrorException(`Failed to get product: ${error.message}`));
      })
    );
  }

  update(id: number, updateProductDto: UpdateProductDto): Observable<Product> {
    return this.findOne(id).pipe(
      switchMap(product => {
        Object.assign(product, updateProductDto);
        return from(this.productRepository.save(product));
      }),
      switchMap(updatedProduct =>
        this.checkAndNotifyLowStock(updatedProduct).pipe(
          map(() => updatedProduct)
        )
      ),
      catchError(error => throwError(() => new InternalServerErrorException(`Failed to update product: ${error.message}`)))
    );
  }

  remove(id: number): Observable<void> {
    return this.findOne(id).pipe(
      switchMap(product => from(this.productRepository.remove(product))),
      tap(() => {
        // Remove from low stock tracking
        this.lowStockNotified.delete(id);
      }),
      map(() => void 0),
      catchError(error => throwError(() => new InternalServerErrorException(`Failed to remove product: ${error.message}`)))
    );
  }

  findByCategory(category: string): Observable<Product[]> {
    return from(this.productRepository.find({
      where: { category, stock: MoreThan(0) }, // Only products with stock > 0
      order: { createdAt: 'DESC' },
    })).pipe(
      catchError(error => throwError(() => new InternalServerErrorException(`Failed to get products by category: ${error.message}`)))
    );
  }

  findFeatured(): Observable<Product[]> {
    return from(this.productRepository.find({
      where: { isSpecial: true, stock: MoreThan(0) }, // Only products with stock > 0
      order: { rating: 'DESC' },
    })).pipe(
      catchError(error => throwError(() => new InternalServerErrorException(`Failed to get featured products: ${error.message}`)))
    );
  }

  // Method to decrease stock (called when order is placed)
  decreaseStock(productId: number, quantity: number): Observable<Product> {
    return this.findOne(productId).pipe(
      switchMap(product => {
        if (product.stock < quantity) {
          throw new BadRequestException(`Insufficient stock for product ${extractString(product.name)}`);
        }

        product.stock -= quantity;
        return from(this.productRepository.save(product));
      }),
      switchMap(updatedProduct =>
        this.checkAndNotifyLowStock(updatedProduct).pipe(
          map(() => updatedProduct)
        )
      ),
      catchError(error => throwError(() => new InternalServerErrorException(`Failed to decrease stock: ${error.message}`)))
    );
  }

  private checkAndNotifyLowStock(product: Product): Observable<void> {
    // Only notify if stock is below threshold and we haven't already notified for this product
    if (product.stock <= this.LOW_STOCK_THRESHOLD && !this.lowStockNotified.has(product.id)) {
      return this.notificationsService.createLowStockNotification(extractString(product.name), product.stock).pipe(
        tap(() => this.lowStockNotified.add(product.id)),
        map(() => void 0)
      );
    }

    return of(void 0);
  }

  searchProducts(searchTerm: string): Observable<Product[]> {
    return from(
      this.productRepository.createQueryBuilder('product')
        .where('product.name::text ILIKE :term', { term: `%${searchTerm}%` })
        .orWhere('product.description::text ILIKE :term', { term: `%${searchTerm}%` })
        .andWhere('product.stock > 0')
        .orderBy('product.createdAt', 'DESC')
        .getMany()
    ).pipe(
      catchError(error => throwError(() => new InternalServerErrorException(`Failed to search products: ${error.message}`)))
    );
  }
}
