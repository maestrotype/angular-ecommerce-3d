import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { take, timeout, catchError, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { ProductService } from '../../core/services/product.service';
import { SectionService } from 'src/admin/services/section.service';
import { Section } from 'src/shared/models/section.model';
import { PageSectionContext } from 'src/shared/models/page-section-context.model';
import { loadPageSectionContext } from 'src/shared/utils/page-section-context.util';
import { isPlatformBrowser } from '@angular/common';
import { findSectionElement } from 'src/shared/utils/section-anchor.util';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  sections: Section[] = [];
  pageContext: PageSectionContext = {};
  sectionsLoading = true;

  skeletonSections = [
    { type: 'hero', height: '600px', delay: 0 },
    { type: 'content', height: '400px', delay: 200 },
    { type: 'content', height: '500px', delay: 400 }
  ];

  constructor(
    private productService: ProductService,
    private sectionService: SectionService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit(): void {
    this.loadSections();
  }

  private loadSections(): void {
    this.sectionsLoading = true;
    this.sectionService.getActiveSections('home').pipe(
      take(1),
      timeout(15000),
      catchError(err => {
        console.error('Error loading sections', err);
        return of([] as Section[]);
      }),
      switchMap(sections => {
        const sorted = (sections || []).sort((a, b) => (a.order || 0) - (b.order || 0));
        return loadPageSectionContext(this.productService, sorted.map(section => section.type)).pipe(
          catchError(() => of({} as PageSectionContext)),
          switchMap(context => of({ sections: sorted, context }))
        );
      })
    ).subscribe({
      next: ({ sections, context }) => {
        this.sections = sections;
        this.pageContext = context;
        this.sectionsLoading = false;
      },
      error: () => {
        this.sectionsLoading = false;
      }
    });
  }

  scrollToSection(sectionId: string): void {
    if (isPlatformBrowser(this.platformId)) {
      const element = findSectionElement(sectionId);
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }
  }
}
