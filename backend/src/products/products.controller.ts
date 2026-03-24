import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ProductsService } from "./products.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
// Using specific Cloudinary configurations instead of diskStorage
import { storage } from '../config/multer-cloudinary.config';
import { productStorage3d } from '../config/multer-cloudinary-product-3d.config';

@Controller("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  findAll(@Query("category") category?: string) {
    if (category) {
      return this.productsService.findByCategory(category);
    }
    return this.productsService.findAll();
  }

  @Get("featured")
  findFeatured() {
    return this.productsService.findFeatured();
  }

  @Get("search")
  searchProducts(@Query("search") searchTerm: string) {
    return this.productsService.searchProducts(searchTerm);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.productsService.findOne(+id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(+id, updateProductDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.productsService.remove(+id);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('image', { 
    storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit for images
  }))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    return { url: file.path };
  }

  @Post('upload-3d')
  @UseInterceptors(FileInterceptor('model', { 
    storage: productStorage3d,
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit for 3D models
  }))
  async upload3dModel(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    try {
      // Cloudinary returns the secure URL in file.path
      console.log('3D Upload successful:', file.path);
      return { url: file.path };
    } catch (error) {
      console.error('3D Upload error details:', error);
      throw new BadRequestException(`Cloudinary upload failed: ${error.message}`);
    }
  }
}

