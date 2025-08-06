import { Directive, Input, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { SeoService, SeoData } from '../../core/services/seo.service';

@Directive({
  selector: '[appSeo]'
})
export class SeoDirective implements OnInit, OnDestroy {
  @Input() seoData: SeoData;
  @Input() seoType: 'product' | 'category' | 'page' = 'page';
  @Input() seoEntity: any;

  private destroy$ = new Subject<void>();

  constructor(
    private seoService: SeoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.updateSeo();

    // Listen to route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.updateSeo();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateSeo(): void {
    if (this.seoData) {
      this.seoService.updateSeo(this.seoData);
    } else if (this.seoEntity) {
      switch (this.seoType) {
        case 'product':
          this.seoService.updateProductSeo(this.seoEntity);
          break;
        case 'category':
          this.seoService.updateCategorySeo(this.seoEntity);
          break;
        default:
          this.seoService.resetSeo();
      }
    } else {
      this.seoService.resetSeo();
    }
  }
} 