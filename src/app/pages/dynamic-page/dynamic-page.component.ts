
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SectionService } from '../../../admin/services/section.service';
import { Section } from '../../../shared/models/section.model';
import { Subject, takeUntil, catchError, of } from 'rxjs';
import { SeoService } from '../../core/services/seo.service';

import { CommonModule } from '@angular/common';
import { SectionRendererComponent } from '../../components/section-renderer/section-renderer.component';

@Component({
  selector: 'app-dynamic-page',
  standalone: true,
  imports: [CommonModule, SectionRendererComponent],
  templateUrl: './dynamic-page.component.html',
  styleUrls: ['./dynamic-page.component.scss']
})

export class DynamicPageComponent implements OnInit, OnDestroy {
  sections: Section[] = [];
  loading = true;
  slug: string = '';
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private sectionService: SectionService,
    private seoService: SeoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.slug = params['slug'];
      if (this.slug) {
        this.loadSections(this.slug);
      }
    });
  }

  loadSections(slug: string): void {
    this.loading = true;
    this.sectionService.getActiveSections(slug).pipe(
      takeUntil(this.destroy$),
      catchError(() => of([]))
    ).subscribe(sections => {
      if (sections && sections.length > 0) {
        this.sections = sections.sort((a, b) => a.order - b.order);
        this.updateSeo(slug, sections[0]);
      } else {
        // If no sections found for this slug, redirect to home or show 404
        // For now, redirect to home to avoid broken links
        this.router.navigate(['/home']);
      }
      this.loading = false;
    });
  }

  updateSeo(slug: string, firstSection: Section): void {
    const title = firstSection.title ? 
      (typeof firstSection.title === 'string' ? firstSection.title : (firstSection.title as any)['en']) : 
      slug.charAt(0).toUpperCase() + slug.slice(1);
    
    this.seoService.updateSeo({
      title: title,
      description: `Information about ${title}`,
      type: 'website'
    });
  }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
