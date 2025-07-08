import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
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
      createOrderDto.customerName
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
    
    // Если статус изменился, создаем уведомление
    if (updateOrderDto.status && updateOrderDto.status !== order.status) {
      await this.notificationsService.create({
        type: 'order_updated' as any,
        title: 'Order Status Updated',
        message: `Order #${id} status changed to ${updateOrderDto.status}`,
        data: { orderId: id, newStatus: updateOrderDto.status, oldStatus: order.status }
      });
    }
    
    Object.assign(order, updateOrderDto);
    return await this.orderRepository.save(order);
  }

  async remove(id: number): Promise<void> {
    const order = await this.findOne(id);
    await this.orderRepository.remove(order);
  }

  async getStats() {
    const totalOrders = await this.orderRepository.count();
    const totalRevenue = await this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.totalAmount)', 'sum')
      .getRawOne();

    return {
      totalOrders,
      totalRevenue: parseFloat(totalRevenue.sum) || 0,
    };
  }
}