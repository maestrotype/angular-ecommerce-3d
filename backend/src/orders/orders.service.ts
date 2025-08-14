import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Observable, from, throwError, forkJoin, of } from 'rxjs';
import { map, catchError, switchMap, tap } from 'rxjs/operators';
import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { ProductsService } from '../products/products.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    private notificationsService: NotificationsService,
    private productsService: ProductsService,
  ) {}

  create(createOrderDto: CreateOrderDto): Observable<Order> {
    // First, check if all products have sufficient stock
    const stockChecks = [];
    if (createOrderDto.items && Array.isArray(createOrderDto.items)) {
      for (const item of createOrderDto.items) {
        if (item.productId && item.quantity) {
          stockChecks.push(
            this.productsService.findOne(item.productId).pipe(
              map(product => {
                if (product.stock < item.quantity) {
                  throw new BadRequestException(`Insufficient stock for product ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`);
                }
                return { product, item };
              })
            )
          );
        }
      }
    }

    // Check stock availability first
    if (stockChecks.length > 0) {
      return forkJoin(stockChecks).pipe(
        switchMap(() => {
          // All products have sufficient stock, proceed with order creation
          const order = this.orderRepository.create(createOrderDto);
          
          return from(this.orderRepository.save(order)).pipe(
            switchMap(savedOrder => {
              // Decrease stock for each item in the order
              const stockUpdates = [];
              for (const item of createOrderDto.items) {
                if (item.productId && item.quantity) {
                  stockUpdates.push(
                    this.productsService.decreaseStock(item.productId, item.quantity)
                  );
                }
              }
              
              // Create notification for new order
              const notification = this.notificationsService.createOrderNotification(
                savedOrder.id, 
                createOrderDto.customerName
              );
              
              // Combine all operations
              const operations = [...stockUpdates, notification];
              if (operations.length === 0) {
                return of(savedOrder);
              }
              
              return forkJoin(operations).pipe(
                map(() => savedOrder)
              );
            })
          );
        }),
        catchError(error => {
          // Stock check failed - don't create order
          return throwError(() => new BadRequestException(`Order cannot be created: ${error.message}`));
        })
      );
    } else {
      // No items to check, create order directly
      const order = this.orderRepository.create(createOrderDto);
      
      return from(this.orderRepository.save(order)).pipe(
        switchMap(savedOrder => {
          // Create notification for new order
          const notification = this.notificationsService.createOrderNotification(
            savedOrder.id, 
            createOrderDto.customerName
          );
          
          return notification.pipe(
            map(() => savedOrder)
          );
        })
      );
    }
  }

  getOrderStats(): Observable<{ totalOrders: number }> {
    return from(this.orderRepository.count()).pipe(
      map(totalOrders => ({ totalOrders })),
      catchError(error => throwError(() => new InternalServerErrorException(`Failed to get order stats: ${error.message}`)))
    );
  }

  findAll(): Observable<Order[]> {
    return from(this.orderRepository.find({
      order: { createdAt: 'DESC' }
    })).pipe(
      catchError(error => throwError(() => new InternalServerErrorException(`Failed to get orders: ${error.message}`)))
    );
  }

  findOne(id: number): Observable<Order> {
    return from(this.orderRepository.findOne({ where: { id } })).pipe(
      map(order => {
        if (!order) {
          throw new NotFoundException(`Order with ID ${id} not found`);
        }
        return order;
      }),
      catchError(error => {
        if (error instanceof NotFoundException) {
          return throwError(() => error);
        }
        return throwError(() => new InternalServerErrorException(`Failed to get order: ${error.message}`));
      })
    );
  }

  update(id: number, updateOrderDto: UpdateOrderDto): Observable<Order> {
    return this.findOne(id).pipe(
      switchMap(order => {
        // If status changed, create notification
        if (updateOrderDto.status && updateOrderDto.status !== order.status) {
          const notification = this.notificationsService.create({
            type: 'order_updated' as any,
            title: 'Order Status Updated',
            message: `Order #${id} status changed to ${updateOrderDto.status}`,
            data: { orderId: id, newStatus: updateOrderDto.status, oldStatus: order.status }
          });
          
          return notification.pipe(
            switchMap(() => {
              Object.assign(order, updateOrderDto);
              return from(this.orderRepository.save(order));
            })
          );
        }
        
        Object.assign(order, updateOrderDto);
        return from(this.orderRepository.save(order));
      }),
      catchError(error => throwError(() => new InternalServerErrorException(`Failed to update order: ${error.message}`)))
    );
  }

  remove(id: number): Observable<void> {
    return this.findOne(id).pipe(
      switchMap(order => from(this.orderRepository.remove(order))),
      map(() => void 0),
      catchError(error => throwError(() => new InternalServerErrorException(`Failed to remove order: ${error.message}`)))
    );
  }

  getStats(): Observable<{ totalOrders: number; totalRevenue: number }> {
    return forkJoin({
      totalOrders: from(this.orderRepository.count()),
      totalRevenue: from(this.orderRepository
        .createQueryBuilder('order')
        .select('SUM(order.totalAmount)', 'sum')
        .getRawOne()
      )
    }).pipe(
      map(({ totalOrders, totalRevenue }) => ({
        totalOrders,
        totalRevenue: parseFloat(totalRevenue.sum) || 0,
      })),
      catchError(error => throwError(() => new InternalServerErrorException(`Failed to get stats: ${error.message}`)))
    );
  }
}