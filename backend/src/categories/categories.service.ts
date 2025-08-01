import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Section } from '../sections/entities/section.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Section)
    private sectionRepository: Repository<Section>,
  ) {}

  async findAll(): Promise<Category[]> {
    return this.categoryRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async create(dto: CreateCategoryDto): Promise<Category> {
    // Generate slug from name if not provided
    if (!dto.slug) {
      dto.slug = dto.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }
    
    const category = this.categoryRepository.create(dto);
    const savedCategory = await this.categoryRepository.save(category);
    
    // Sync with sections
    await this.syncWithSections();
    
    return savedCategory;
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOne(id);
    
    // Generate slug from name if not provided
    if (dto.name && !dto.slug) {
      dto.slug = dto.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }
    
    Object.assign(category, dto);
    const updatedCategory = await this.categoryRepository.save(category);
    
    // Sync with sections
    await this.syncWithSections();
    
    return updatedCategory;
  }

  async remove(id: string): Promise<void> {
    const category = await this.findOne(id);
    await this.categoryRepository.remove(category);
    
    // Sync with sections
    await this.syncWithSections();
  }

  async syncWithSections(): Promise<void> {
    // Get all active categories
    const categories = await this.categoryRepository.find({ 
      where: { isActive: true },
      order: { createdAt: 'ASC' }
    });

    // Find the categories section
    const categoriesSection = await this.sectionRepository.findOne({
      where: { type: 'categories' }
    });

    if (!categoriesSection) {
      throw new NotFoundException('Categories section not found');
    }

    // Transform categories to section format with proper slug and icon
    const sectionCategories = categories.map(cat => {
      const slug = cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      let icon = cat.icon;
      
      // Set default icons based on category name
      if (!icon) {
        switch (cat.name.toLowerCase()) {
          case 'shoes':
            icon = 'assets/icons/shoes.svg';
            break;
          case 'handbags':
            icon = 'assets/icons/handbags.svg';
            break;
          case 'clothing':
            icon = 'assets/icons/clothing.svg';
            break;
          case 'auto':
            icon = 'assets/icons/auto.svg';
            break;
          default:
            icon = 'assets/icons/default-category.svg';
        }
      }

      return {
        name: cat.name,
        slug: slug,
        icon: icon,
        isActive: cat.isActive
      };
    });

    // Update section settings
    categoriesSection.settings = {
      ...categoriesSection.settings,
      categories: sectionCategories
    };

    await this.sectionRepository.save(categoriesSection);
  }
}