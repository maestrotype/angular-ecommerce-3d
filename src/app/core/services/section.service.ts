import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, timer } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import {
  CreateSectionDto,
  Section,
  UpdateSectionDto,
} from 'src/shared/models/section.model';
import { environment } from '../../../environments/environment';
import { getDemoSections } from '../../../shared/constants/demo-catalog';
import { DemoCatalogStateService } from './demo-catalog-state.service';
import { StorefrontCatalogCacheService } from './storefront-catalog-cache.service';
import { STOREFRONT_DEMO_DELAY_MS } from '../../../shared/utils/storefront-catalog-stream.util';

@Injectable({
  providedIn: 'root',
})
export class SectionService {
  private readonly apiUrl = `${environment.apiUrl}/sections`;
  private readonly sectionSubjects = new Map<string, BehaviorSubject<Section[] | null>>();
  private readonly bootstrappedKeys = new Set<string>();

  constructor(
    private http: HttpClient,
    private demoCatalogState: DemoCatalogStateService,
    private catalogCache: StorefrontCatalogCacheService,
  ) {}

  getSections(): Observable<Section[]> {
    return this.http.get<Section[]>(`${this.apiUrl}/admin`);
  }

  getActiveSections(pageTarget?: string, type?: string): Observable<Section[]> {
    const cacheKey = this.sectionCacheKey(pageTarget, type);
    this.bootstrapSectionsIfNeeded(cacheKey, pageTarget, type);
    return this.sectionSubjects.get(cacheKey)!.pipe(
      filter((sections): sections is Section[] => sections !== null),
    );
  }

  getSection(id: number): Observable<Section> {
    return this.http.get<Section>(`${this.apiUrl}/${id}`);
  }

  createSection(section: CreateSectionDto): Observable<Section> {
    return this.http.post<Section>(this.apiUrl, section);
  }

  updateSection(id: number, section: UpdateSectionDto): Observable<Section> {
    return this.http.patch<Section>(`${this.apiUrl}/${id}`, section);
  }

  deleteSection(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  toggleSection(id: number): Observable<Section> {
    return this.http.patch<Section>(`${this.apiUrl}/${id}/toggle`, {});
  }

  reorderSections(sectionIds: number[]): Observable<Section[]> {
    return this.http.post<Section[]>(`${this.apiUrl}/reorder`, { sectionIds });
  }

  uploadImage(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('image', file);
    return this.http.post<{ url: string }>(`${environment.apiUrl}/uploads/section-image`, formData);
  }

  uploadVideo(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('video', file);
    return this.http.post<{ url: string }>(`${environment.apiUrl}/uploads/section-video`, formData);
  }

  upload3dModel(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('model', file);
    return this.http.post<{ url: string }>(
      `${environment.apiUrl}/uploads/section-3d-model`,
      formData,
    );
  }

  private sectionCacheKey(pageTarget?: string, type?: string): string {
    return `sections:${pageTarget || 'all'}:${type || 'all'}`;
  }

  private bootstrapSectionsIfNeeded(
    cacheKey: string,
    pageTarget?: string,
    type?: string,
  ): void {
    if (!this.sectionSubjects.has(cacheKey)) {
      this.sectionSubjects.set(cacheKey, new BehaviorSubject<Section[] | null>(null));
    }
    if (this.bootstrappedKeys.has(cacheKey)) {
      return;
    }
    this.bootstrappedKeys.add(cacheKey);

    const params: Record<string, string> = {};
    if (pageTarget) {
      params.pageTarget = pageTarget;
    }
    if (type) {
      params.type = type;
    }

    const demo = getDemoSections(pageTarget);
    const cached = this.catalogCache.read<Section[]>(cacheKey);
    const subject = this.sectionSubjects.get(cacheKey)!;

    if (cached?.length) {
      subject.next(cached);
      this.demoCatalogState.setDemoMode(false);
    }

    this.http.get<Section[]>(this.apiUrl, { params }).pipe(take(1)).subscribe({
      next: (sections) => this.applyLiveSections(cacheKey, subject, sections),
      error: () => {
        if (subject.value === null) {
          subject.next([]);
        }
      },
    });

    if (!cached?.length && demo.length) {
      this.scheduleDemoSectionsFallback(cacheKey, subject, demo);
    } else if (!cached?.length && !demo.length) {
      subject.next([]);
    }
  }

  private scheduleDemoSectionsFallback(
    cacheKey: string,
    subject: BehaviorSubject<Section[] | null>,
    demo: Section[],
  ): void {
    timer(STOREFRONT_DEMO_DELAY_MS).subscribe(() => {
      const current = subject.value;
      if (current !== null && current.length > 0 && current[0]?.id > 0) {
        return;
      }
      subject.next(demo);
      this.demoCatalogState.setDemoMode(true);
    });
  }

  private applyLiveSections(
    cacheKey: string,
    subject: BehaviorSubject<Section[] | null>,
    sections: Section[],
  ): void {
    this.catalogCache.write(cacheKey, sections);
    subject.next(sections);
    this.demoCatalogState.setDemoMode(false);
  }
}
