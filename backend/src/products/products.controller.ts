
import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    UseGuards,
  } from '@nestjs/common';
  import { ProductsService } from './products.service';
  import { CreateProductDto } from './dto/create-product.dto';
  import { UpdateProductDto } from './dto/update-product.dto';
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
  import { AdminGuard } from '../auth/guards/admin.guard';
  
  @Controller('products')
  export class ProductsController {
    constructor(private readonly productsService: ProductsService) {}
  
    @Post()
    @UseGuards(JwtAuthGuard, AdminGuard)
    create(@Body() createProductDto: CreateProductDto) {
      return this.productsService.create(createProductDto);
    }
  
    @Get()
    findAll(@Query('category') category?: string) {
      if (category) {
        return this.productsService.findByCategory(category);
      }
      return this.productsService.findAll();
    }
  
    @Get('featured')
    findFeatured() {
      return this.productsService.findFeatured();
    }
  
    @Get(':id')
    findOne(@Param('id') id: string) {
      return this.productsService.findOne(+id);
    }
  
    @Patch(':id')
    @UseGuards(JwtAuthGuard, AdminGuard)
    update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
      return this.productsService.update(+id, updateProductDto);
    }
  
    @Delete(':id')
    @UseGuards(JwtAuthGuard, AdminGuard)
    remove(@Param('id') id: string) {
      return this.productsService.remove(+id);
    }
  }
  