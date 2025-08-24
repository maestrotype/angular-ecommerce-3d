
import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Query,
  } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
  import { OrdersService } from './orders.service';
  import { CreateOrderDto } from './dto/create-order.dto';
  import { UpdateOrderDto } from './dto/update-order.dto';
  
  @Controller('orders')
  export class OrdersController {
    constructor(private readonly ordersService: OrdersService) {}
  
    @Post()
    create(@Body() createOrderDto: CreateOrderDto) {
      return this.ordersService.create(createOrderDto);
    }
  
    @Get()
    findAll() {
      return this.ordersService.findAll();
    }
  
    @Get('stats')
    getStats() {
      return this.ordersService.getOrderStats();
    }
  
      @Get(':id')
  findOne(@Param('id') id: string): Observable<any> {
    return this.ordersService.findOne(+id).pipe(
      map(order => ({
        success: true,
        data: order,
        message: 'Order retrieved successfully'
      })),
      catchError(error => of({
        success: false,
        error: error.message || 'Failed to retrieve order'
      }))
    );
  }
  
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
      return this.ordersService.update(+id, updateOrderDto);
    }
  }
  