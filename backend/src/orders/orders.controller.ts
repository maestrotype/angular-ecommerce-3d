
import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Query,
  } from '@nestjs/common';
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
    findOne(@Param('id') id: string) {
      return this.ordersService.findOne(+id);
    }
  
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
      return this.ordersService.update(+id, updateOrderDto);
    }
  }
  