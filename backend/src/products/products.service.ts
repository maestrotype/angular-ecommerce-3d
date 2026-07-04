
import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
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

// Interface for product response with optional warning
export interface ProductWithWarning {
  product: Product;
  modelHostingWarning?: boolean;
  modelHostingMessage?: string;
  modelHostingMessageKey?: string;
}

@Injectable()
export class ProductsService {
  private readonly LOW_STOCK_THRESHOLD = 10;
  private lowStockNotified = new Set<number>(); // Track products we've already notified about

  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private notificationsService: NotificationsService,
  ) { }

  private logger = new Logger(ProductsService.name);

  create(createProductDto: CreateProductDto): Observable<Product> {
    return this.createWithWarning(createProductDto).pipe(
      map(result => result.product)
    );
  }

  /**
   * Create a product and return it with an optional model hosting warning.
   */
  createWithWarning(createProductDto: CreateProductDto): Observable<ProductWithWarning> {
    const hasWarning = this.validate3dModelUrl(createProductDto.model3dUrl);

    const product = this.productRepository.create(createProductDto);

    return from(this.productRepository.save(product)).pipe(
      switchMap(savedProduct =>
        this.checkAndNotifyLowStock(savedProduct).pipe(
          map(() => savedProduct)
        )
      ),
      map(savedProduct => {
        const result: ProductWithWarning = { product: savedProduct };
        if (hasWarning) {
          result.modelHostingWarning = true;
          result.modelHostingMessageKey = 'MODEL_HOSTING_WARNING';
        }
        return result;
      }),
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
    return this.updateWithWarning(id, updateProductDto).pipe(
      map(result => result.product)
    );
  }

  /**
   * Update a product and return it with an optional model hosting warning.
   */
  updateWithWarning(id: number, updateProductDto: UpdateProductDto): Observable<ProductWithWarning> {
    const hasWarning = this.validate3dModelUrl(updateProductDto.model3dUrl);

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
      map(updatedProduct => {
        const result: ProductWithWarning = { product: updatedProduct };
        if (hasWarning) {
          result.modelHostingWarning = true;
          result.modelHostingMessageKey = 'MODEL_HOSTING_WARNING';
        }
        return result;
      }),
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

  /**
   * Validate that the 3D model URL is accessible from the public frontend.
   * On production, local file paths won't work for public users.
   * Returns true if there's a warning, false otherwise.
   */
  private validate3dModelUrl(url?: string): boolean {
    if (!url) return false;

    const isProduction = process.env.NODE_ENV?.toLowerCase() === 'production' || process.env.RENDER === 'true';
    if (!isProduction) return false;

    const isCloudinary = url.includes('res.cloudinary.com');
    if (isCloudinary) return false;

    // Check if it's a local file path or localhost URL
    const isLocalPath = url.startsWith('LOCAL:') ||
      url.includes('localhost') ||
      url.includes('127.0.0.1') ||
      (url.startsWith('/') && !url.includes('/uploads/'));

    if (isLocalPath) {
      this.logger.warn(
        `⚠️  Product "${url}" has a local model URL that won't be accessible on production. ` +
        `Use POST /uploads/archive-local to upload the model to Cloudinary first.`
      );
      return true; // Warning returned but save is allowed
    }

    // For other non-Cloudinary URLs (e.g., external CDN), allow but log
    this.logger.warn(
      `⚠️  Product model URL is not on Cloudinary: ${url}. ` +
      `Ensure it's publicly accessible from the frontend.`
    );
    return true;
  }

  /**
   * Get the local 3D model file path for a product.
   * Used to serve local GLB files to the public frontend.
   */
  getLocal3dModel(productId: number): Observable<{ localPath: string; fileName: string }> {
    return from(
      this.productRepository.findOne({ where: { id: productId } })
    ).pipe(
      switchMap(product => {
        if (!product) {
          return throwError(() => new NotFoundException(`Product with ID ${productId} not found`));
        }
        if (!product.localModel3dUrl) {
          return throwError(() => new NotFoundException(`Product ${productId} has no local 3D model`));
        }
        const fileName = product.localModel3dUrl.split('/').pop();
        return of({ localPath: product.localModel3dUrl, fileName });
      }),
      catchError(error => {
        if (error instanceof NotFoundException) {
          return throwError(() => error);
        }
        return throwError(() => new InternalServerErrorException(`Failed to get product 3D model: ${error.message}`));
      })
    );
  }
}
