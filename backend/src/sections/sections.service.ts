
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Section } from './entities/section.entity';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { ReorderSectionsDto } from './dto/reorder-sections.dto';
import { Observable, from, throwError } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';

@Injectable()
export class SectionsService {
  constructor(
    @InjectRepository(Section)
    private sectionRepository: Repository<Section>,
  ) {}

  create(createSectionDto: CreateSectionDto): Observable<Section> {
    return from(this.sectionRepository
      .createQueryBuilder('section')
      .select('MAX(section.order)', 'maxOrder')
      .getRawOne()
    ).pipe(
      switchMap(maxOrderResult => {
        const section = this.sectionRepository.create({
          ...createSectionDto,
          order: createSectionDto.order ?? (maxOrderResult.maxOrder || 0) + 1,
        });

        return from(this.sectionRepository.save(section));
      }),
      catchError(error => {
        console.error('[SectionsService] Create error:', error);
        return throwError(() => error);
      })
    );
  }

  findAll(): Observable<Section[]> {
    return from(this.sectionRepository.find({
      order: { order: 'ASC' },
    })).pipe(
      catchError(error => {
        console.error('[SectionsService] Find all error:', error);
        return throwError(() => error);
      })
    );
  }

  findAllActive(pageTarget?: string): Observable<Section[]> {
    const where: any = { isActive: true };
    if (pageTarget) {
      where.pageTarget = pageTarget;
    }
    
    return from(this.sectionRepository.find({
      where,
      order: { order: 'ASC' },
    })).pipe(
      catchError(error => {
        console.error('[SectionsService] Find all active error:', error);
        return throwError(() => error);
      })
    );
  }

  findOne(id: number): Observable<Section> {
    return from(this.sectionRepository.findOne({ where: { id } })).pipe(
      map(section => {
        if (!section) {
          throw new NotFoundException(`Section with ID ${id} not found`);
        }
        return section;
      }),
      catchError(error => {
        console.error('[SectionsService] Find one error:', error);
        return throwError(() => error);
      })
    );
  }

  update(id: number, updateSectionDto: UpdateSectionDto): Observable<Section> {
    return this.findOne(id).pipe(
      switchMap(section => {
        Object.assign(section, updateSectionDto);
        return from(this.sectionRepository.save(section));
      }),
      catchError(error => {
        console.error('[SectionsService] Update error:', error);
        return throwError(() => error);
      })
    );
  }

  remove(id: number): Observable<void> {
    return this.findOne(id).pipe(
      switchMap(section => from(this.sectionRepository.remove(section))),
      map(() => void 0),
      catchError(error => {
        console.error('[SectionsService] Remove error:', error);
        return throwError(() => error);
      })
    );
  }

  toggleActive(id: number): Observable<Section> {
    return this.findOne(id).pipe(
      switchMap(section => {
        section.isActive = !section.isActive;
        return from(this.sectionRepository.save(section));
      }),
      catchError(error => {
        console.error('[SectionsService] Toggle active error:', error);
        return throwError(() => error);
      })
    );
  }

  reorder(reorderSectionsDto: ReorderSectionsDto): Observable<Section[]> {
    const { sectionIds } = reorderSectionsDto;

    return from(Promise.all(sectionIds.map((sectionId, index) => 
      this.sectionRepository.update(sectionId, { order: index + 1 })
    ))).pipe(
      switchMap(() => this.findAll()),
      catchError(error => {
        console.error('[SectionsService] Reorder error:', error);
        return throwError(() => error);
      })
    );
  }
}

