
import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
  } from '@nestjs/common';
  import { SectionsService } from './sections.service';
  import { CreateSectionDto } from './dto/create-section.dto';
  import { UpdateSectionDto } from './dto/update-section.dto';
  import { ReorderSectionsDto } from './dto/reorder-sections.dto';
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
  
  @Controller('sections')
  export class SectionsController {
    constructor(private readonly sectionsService: SectionsService) {}
  
    @Post()
    @UseGuards(JwtAuthGuard)
    create(@Body() createSectionDto: CreateSectionDto) {
      return this.sectionsService.create(createSectionDto);
    }
  
    @Get()
    findAll() {
      return this.sectionsService.findAllActive();
    }
  
    @Get('admin')
    @UseGuards(JwtAuthGuard)
    findAllForAdmin() {
      return this.sectionsService.findAll();
    }
  
    @Get(':id')
    @UseGuards(JwtAuthGuard)
    findOne(@Param('id') id: string) {
      return this.sectionsService.findOne(+id);
    }
  
    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    update(@Param('id') id: string, @Body() updateSectionDto: UpdateSectionDto) {
      return this.sectionsService.update(+id, updateSectionDto);
    }
  
    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    remove(@Param('id') id: string) {
      return this.sectionsService.remove(+id);
    }
  
    @Patch(':id/toggle')
    @UseGuards(JwtAuthGuard)
    toggleActive(@Param('id') id: string) {
      return this.sectionsService.toggleActive(+id);
    }
  
    @Post('reorder')
    @UseGuards(JwtAuthGuard)
    reorder(@Body() reorderSectionsDto: ReorderSectionsDto) {
      return this.sectionsService.reorder(reorderSectionsDto);
    }
  }
  