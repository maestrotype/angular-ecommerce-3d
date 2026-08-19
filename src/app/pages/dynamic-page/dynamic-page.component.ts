
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SectionService } from '../../../admin/services/section.service';
import { PageService } from '../../../admin/services/page.service';
import { Section } from '../../../shared/models/section.model';
import { Page, isSectionBasedPageTemplate } from '../../../shared/models/page.model';
import { Subject, takeUntil, catchError, of, switchMap } from 'rxjs';
import { SeoService } from '../../core/services/seo.service';
import { ProductService } from '../../core/services/product.service';
import { PageSectionContext } from '../../../shared/models/page-section-context.model';
import { loadPageSectionContext } from '../../../shared/utils/page-section-context.util';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { getLocalizedString } from 'src/shared/utils/localization.util';

import { CommonModule } from '@angular/common';
import { SectionRendererComponent } from '../../components/section-renderer/section-renderer.component';
import { ContactsComponent } from '../contacts/contacts.component';
import { LocalizedPipe } from '../../shared/pipes/localized.pipe';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-dynamic-page',
  standalone: true,
  imports: [CommonModule, SectionRendererComponent, ContactsComponent, LocalizedPipe, RouterModule, TranslateModule],
  templateUrl: './dynamic-page.component.html',
  styleUrls: ['./dynamic-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class DynamicPageComponent implements OnInit, OnDestroy {
  page: Page | null = null;
  sections: Section[] = [];
  pageContext: PageSectionContext = {};
  loading = true;
  notFound = false;
  slug = '';
  safeContent: SafeHtml = '';
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private sectionService: SectionService,
    private pageService: PageService,
    private productService: ProductService,
    private seoService: SeoService,
    private sanitizer: DomSanitizer,
    private translate: TranslateService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.slug = params['slug'];
      if (this.slug) {
        this.loadPage(this.slug);
      }
    });
  }

  loadPage(slug: string): void {
    this.loading = true;
    this.notFound = false;
    this.page = null;
    this.sections = [];
    this.pageContext = {};

    this.pageService.getPageBySlug(slug).pipe(
      takeUntil(this.destroy$),
      catchError(() => of(null)),
    ).subscribe(page => {
      if (!page) {
        this.loading = false;
        this.notFound = true;
        this.cdr.markForCheck();
        return;
      }

      this.page = page;
      this.updateSeo(page);

      if (isSectionBasedPageTemplate(page.template)) {
        this.loadSections(slug);
        return;
      }

      if (page.template === 'simple') {
        const raw = getLocalizedString(page.content, this.translate.currentLang || 'en');
        this.safeContent = this.sanitizer.bypassSecurityTrustHtml(raw || '');
      }

      this.loading = false;
      this.cdr.markForCheck();
    });
  }

  private loadSections(slug: string): void {
    this.sectionService.getActiveSections(slug).pipe(
      takeUntil(this.destroy$),
      catchError(() => of([] as Section[])),
      switchMap(sections => {
        const sorted = (sections || []).sort((a, b) => a.order - b.order);
        return loadPageSectionContext(this.productService, sorted.map(section => section.type)).pipe(
          catchError(() => of({} as PageSectionContext)),
          switchMap(context => of({ sections: sorted, context }))
        );
      })
    ).subscribe(({ sections, context }) => {
      this.sections = sections;
      this.pageContext = context;
      this.loading = false;
      this.cdr.markForCheck();
    });
  }

  private updateSeo(page: Page): void {
    const title = getLocalizedString(page.title, this.translate.currentLang || 'en') || page.slug;
    const description = getLocalizedString(page.seoDescription, this.translate.currentLang || 'en')
      || `Information about ${title}`;

    this.seoService.updateSeo({
      title,
      description,
      type: 'website',
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  isSectionsLayout(template: string | undefined): boolean {
    return !!template && isSectionBasedPageTemplate(template);
  }

  trackBySectionId(_index: number, section: Section): number | string {
    return section.id ?? _index;
  }
}
