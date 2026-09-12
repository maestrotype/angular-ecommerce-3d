import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { resolveUiLanguage } from 'src/shared/utils/ui-language.util';

@Component({
  selector: 'app-admin-layout',
  templateUrl: 'admin-layout.component.html',
  styleUrls: ['admin-layout.component.scss'],
})
export class AdminLayoutComponent implements OnInit, OnDestroy {
  isMobile = false;
  private readonly destroy$ = new Subject<void>();

  constructor(
    private translate: TranslateService,
    private breakpointObserver: BreakpointObserver
  ) {
    const savedLang = resolveUiLanguage(
      localStorage.getItem('adminLang') ||
        localStorage.getItem('preferredLanguage') ||
        'en'
    );
    this.translate.setDefaultLang('en');
    this.translate.use(savedLang);
    this.isMobile = this.matchesMobileShell();
  }

  ngOnInit(): void {
    this.breakpointObserver
      .observe(['(max-width: 1024px)'])
      .pipe(takeUntil(this.destroy$))
      .subscribe((state) => {
        this.isMobile = state.matches;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private matchesMobileShell(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }
    return window.matchMedia('(max-width: 1024px)').matches;
  }
}
