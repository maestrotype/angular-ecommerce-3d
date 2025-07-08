
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    private notificationsService: NotificationsService,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const order = this.orderRepository.create(createOrderDto);
    const savedOrder = await this.orderRepository.save(order);
    
    await this.notificationsService.createOrderNotification(
      savedOrder.id,
      savedOrder.customerName
    );
    
    return savedOrder;
  }

  async findAll(): Promise<Order[]> {
    return await this.orderRepository.find({
      order: { createdAt: 'DESC' }
    });
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }

  async update(id: number, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.findOne(id);
    const oldStatus = order.status;
    Object.assign(order, updateOrderDto);
    const updatedOrder = await this.orderRepository.save(order);
    
    if (oldStatus !== updateOrderDto.status && updateOrderDto.status) {
      await this.notificationsService.create({
        type: 'order_updated' as any,
        title: 'Order Status Updated',
        message: `Order #${id} status changed from ${oldStatus} to ${updateOrderDto.status}`,
        data: { orderId: id, oldStatus, newStatus: updateOrderDto.status }
      });
    }
    
    return updatedOrder;
  }

  async getOrderStats() {
    const total = await this.orderRepository.count();
    const pending = await this.orderRepository.count({ 
      where: { status: OrderStatus.PENDING } 
    });
    const confirmed = await this.orderRepository.count({ 
      where: { status: OrderStatus.CONFIRMED } 
    });
    const shipped = await this.orderRepository.count({ 
      where: { status: OrderStatus.SHIPPED } 
    });

    return { total, pending, confirmed, shipped };
  }
}
