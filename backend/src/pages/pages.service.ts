import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Page } from './entities/page.entity';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { Section } from '../sections/entities/section.entity';
import { DEFAULT_FOOTER_COLUMNS, DEFAULT_PAGES } from './default-page-content';

const RESERVED_SLUGS = new Set([
  'admin',
  'home',
  'shop',
  'about',
  'contacts',
  'product',
  'checkout',
  'payment',
  'favorites',
  'my-orders',
  'viewer',
  'api',
]);

@Injectable()
export class PagesService implements OnModuleInit {
  constructor(
    @InjectRepository(Page)
    private readonly pageRepository: Repository<Page>,
    @InjectRepository(Section)
    private readonly sectionRepository: Repository<Section>,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.removeLegacyReturnsPage();
    await this.seedDefaultPages();
    await this.syncDefaultPagesContent();
    await this.syncFooterSection();
  }

  private async removeLegacyReturnsPage(): Promise<void> {
    const returnsPage = await this.pageRepository.findOne({ where: { slug: 'returns' } });
    if (returnsPage) {
      await this.sectionRepository.delete({ pageTarget: 'returns' });
      await this.pageRepository.remove(returnsPage);
    }
  }

  private async seedDefaultPages(): Promise<void> {
    for (const page of DEFAULT_PAGES) {
      const exists = await this.pageRepository.findOne({ where: { slug: page.slug } });
      if (!exists) {
        await this.pageRepository.save(this.pageRepository.create(page));
      }
    }
  }

  private async syncDefaultPagesContent(): Promise<void> {
    for (const pageData of DEFAULT_PAGES) {
      const existing = await this.pageRepository.findOne({ where: { slug: pageData.slug } });
      if (!existing) continue;

      existing.title = pageData.title;
      existing.content = pageData.content;
      existing.seoDescription = pageData.seoDescription;
      existing.template = pageData.template;
      existing.status = pageData.status;
      await this.pageRepository.save(existing);
    }
  }

  private async syncFooterSection(): Promise<void> {
    const footer = await this.sectionRepository.findOne({ where: { type: 'footer' } });
    if (!footer) return;

    const settings = footer.settings || {};
    const columns = settings.columns || [];
    const hasReturnsLink = columns.some((col: any) =>
      (col.links || []).some((link: any) => link.url === '/returns'),
    );
    const hasStaticCategories = columns.some((col: any) =>
      (col.links || []).some((link: any) => typeof link.url === 'string' && link.url.includes('/shop?category=')),
    );
    const copyright = settings.copyright;
    const hasBadCopyright = typeof copyright === 'string' && copyright.trim().length > 0 && copyright.trim().length < 12;

    if (!hasReturnsLink && !hasStaticCategories && !hasBadCopyright && columns.some((c: any) => c.linkSource === 'shop-categories')) {
      return;
    }

    footer.settings = {
      ...settings,
      columns: DEFAULT_FOOTER_COLUMNS,
      copyright: hasBadCopyright ? '' : copyright,
    };

    await this.sectionRepository.save(footer);
  }

  findAll(): Promise<Page[]> {
    return this.pageRepository.find({ order: { slug: 'ASC' } });
  }

  findPublished(): Promise<Page[]> {
    return this.pageRepository.find({
      where: { status: 'published' },
      order: { slug: 'ASC' },
    });
  }

  async findBySlug(slug: string, publishedOnly = true): Promise<Page> {
    const page = await this.pageRepository.findOne({ where: { slug } });
    if (!page || (publishedOnly && page.status !== 'published')) {
      throw new NotFoundException(`Page "${slug}" not found`);
    }
    return page;
  }

  async findOne(id: number): Promise<Page> {
    const page = await this.pageRepository.findOne({ where: { id } });
    if (!page) {
      throw new NotFoundException(`Page with ID ${id} not found`);
    }
    return page;
  }

  async create(dto: CreatePageDto): Promise<Page> {
    this.assertSlugAllowed(dto.slug);
    const existing = await this.pageRepository.findOne({ where: { slug: dto.slug } });
    if (existing) {
      throw new ConflictException(`Page with slug "${dto.slug}" already exists`);
    }

    const page = this.pageRepository.create({
      slug: dto.slug,
      title: dto.title,
      content: dto.content || {},
      seoDescription: dto.seoDescription || {},
      template: dto.template || 'simple',
      status: dto.status || 'draft',
    });

    return this.pageRepository.save(page);
  }

  async update(id: number, dto: UpdatePageDto): Promise<Page> {
    const page = await this.findOne(id);

    if (dto.slug && dto.slug !== page.slug) {
      this.assertSlugAllowed(dto.slug);
      const existing = await this.pageRepository.findOne({ where: { slug: dto.slug } });
      if (existing && existing.id !== id) {
        throw new ConflictException(`Page with slug "${dto.slug}" already exists`);
      }
    }

    Object.assign(page, dto);
    return this.pageRepository.save(page);
  }

  async remove(id: number): Promise<void> {
    const page = await this.findOne(id);
    await this.sectionRepository.delete({ pageTarget: page.slug });
    await this.pageRepository.remove(page);
  }

  private assertSlugAllowed(slug: string): void {
    if (RESERVED_SLUGS.has(slug)) {
      throw new BadRequestException(`Slug "${slug}" is reserved`);
    }
  }
}
