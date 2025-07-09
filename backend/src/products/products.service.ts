
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { NotificationsService } from '../notifications/notifications.service';
@Injectable()
export class ProductsService {
  private readonly LOW_STOCK_THRESHOLD = 10;
  private lowStockNotified = new Set<number>(); // Track products we've already notified about

  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private notificationsService: NotificationsService,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productRepository.create(createProductDto);
    const savedProduct = await this.productRepository.save(product);
    
    // Check for low stock on new product
    await this.checkAndNotifyLowStock(savedProduct);
    
    return savedProduct;
  }

  async findAll(): Promise<Product[]> {
    return await this.productRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);
    Object.assign(product, updateProductDto);
    const updatedProduct = await this.productRepository.save(product);
    
    // Check for low stock after update
    await this.checkAndNotifyLowStock(updatedProduct);
    
    return updatedProduct;
  }

  async remove(id: number): Promise<void> {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
    
    // Remove from low stock tracking
    this.lowStockNotified.delete(id);
  }

  async findByCategory(category: string): Promise<Product[]> {
    return await this.productRepository.find({
      where: { category },
      order: { createdAt: 'DESC' },
    });
  }

  async findFeatured(): Promise<Product[]> {
    return await this.productRepository.find({
      where: { isSpecial: true },
      order: { rating: 'DESC' },
    });
  }

  // Method to decrease stock (called when order is placed)
  async decreaseStock(productId: number, quantity: number): Promise<Product> {
    const product = await this.findOne(productId);
    
    if (product.stock < quantity) {
      throw new Error(`Insufficient stock for product ${product.name}`);
    }
    
    product.stock -= quantity;
    const updatedProduct = await this.productRepository.save(product);
    
    // Check for low stock after decreasing
    await this.checkAndNotifyLowStock(updatedProduct);
    
    return updatedProduct;
  }

  private async checkAndNotifyLowStock(product: Product): Promise<void> {
    // Only notify if stock is below threshold and we haven't already notified for this product
    if (product.stock <= this.LOW_STOCK_THRESHOLD && !this.lowStockNotified.has(product.id)) {
      await this.notificationsService.createLowStockNotification(product.name, product.stock);
      this.lowStockNotified.add(product.id);
    }
    
    // If stock is replenished above threshold, remove from notified set
    if (product.stock > this.LOW_STOCK_THRESHOLD && this.lowStockNotified.has(product.id)) {
      this.lowStockNotified.delete(product.id);
    }
  }
}
