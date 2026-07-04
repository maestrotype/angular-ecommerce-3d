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
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
  Res
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ProductsService } from "./products.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import * as fs from 'fs';

@Controller("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.createWithWarning(createProductDto);
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

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.productsService.findOne(+id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.updateWithWarning(+id, updateProductDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.productsService.remove(+id);
  }

  // NOTE: Image uploads are handled by UploadsController at POST /uploads
  // NOTE: 3D model uploads are handled by UploadsController at POST /uploads/product-3d-model
   // which stores files on Cloudinary (environment-independent storage).

    /**
     * Serve local 3D model files to the public frontend.
     * This endpoint is needed when models are stored on local disk (e.g., > 10MB models
     * that haven't been archived to Cloudinary yet).
     */
    @Get(":id/3d-model")
    serve3dModel(@Param("id") id: string, @Res() res: any) {
      this.productsService.getLocal3dModel(parseInt(id, 10)).subscribe({
        next: (result) => {
          const fullPath = result.localPath;

          // Verify file exists
          if (!fs.existsSync(fullPath)) {
            return res.status(404).json({
              success: false,
              message: `3D model file not found: ${fullPath}`
            });
          }

          // Determine content type based on file extension (NestJS-compatible, no path module)
          const fileExt = fullPath.split('.').pop()?.toLowerCase() || '';
          let contentType = 'application/octet-stream';
          if (fileExt === 'glb') {
            contentType = 'model/gltf-binary';
          } else if (fileExt === 'gltf') {
            contentType = 'model/gltf+json';
          }

          res.setHeader('Content-Type', contentType);
          res.setHeader('Accept-Ranges', 'bytes');
          res.sendFile(fullPath);
        },
        error: (error) => {
          if (error instanceof NotFoundException) {
            return res.status(404).json({
              success: false,
              message: error.message
            });
          }
          return res.status(500).json({
            success: false,
            message: 'Failed to serve 3D model'
          });
        }
      });
    }
 }
