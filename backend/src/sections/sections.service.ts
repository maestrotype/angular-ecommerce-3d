
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Section } from './entities/section.entity';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { ReorderSectionsDto } from './dto/reorder-sections.dto';

@Injectable()
export class SectionsService {
  constructor(
    @InjectRepository(Section)
    private sectionRepository: Repository<Section>,
  ) {}

  async create(createSectionDto: CreateSectionDto): Promise<Section> {
    const maxOrder = await this.sectionRepository
      .createQueryBuilder('section')
      .select('MAX(section.order)', 'maxOrder')
      .getRawOne();

    const section = this.sectionRepository.create({
      ...createSectionDto,
      order: createSectionDto.order ?? (maxOrder.maxOrder || 0) + 1,
    });

    return await this.sectionRepository.save(section);
  }

  async findAll(): Promise<Section[]> {
    return await this.sectionRepository.find({
      order: { order: 'ASC' },
    });
  }

  async findAllActive(): Promise<Section[]> {
    return await this.sectionRepository.find({
      where: { isActive: true },
      order: { order: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Section> {
    const section = await this.sectionRepository.findOne({ where: { id } });
    if (!section) {
      throw new NotFoundException(`Section with ID ${id} not found`);
    }
    return section;
  }

  async update(id: number, updateSectionDto: UpdateSectionDto): Promise<Section> {
    const section = await this.findOne(id);
    Object.assign(section, updateSectionDto);
    return await this.sectionRepository.save(section);
  }

  async remove(id: number): Promise<void> {
    const section = await this.findOne(id);
    await this.sectionRepository.remove(section);
  }

  async toggleActive(id: number): Promise<Section> {
    const section = await this.findOne(id);
    section.isActive = !section.isActive;
    return await this.sectionRepository.save(section);
  }

  async reorder(reorderSectionsDto: ReorderSectionsDto): Promise<Section[]> {
    const { sectionIds } = reorderSectionsDto;

    for (let i = 0; i < sectionIds.length; i++) {
      await this.sectionRepository.update(sectionIds[i], { order: i + 1 });
    }

    return await this.findAll();
  }
}

