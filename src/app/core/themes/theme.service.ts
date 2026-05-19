import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { Theme } from './theme.model';
import { AVAILABLE_THEMES, DEFAULT_THEME_ID } from './theme-config';

export type Area = 'frontend' | 'admin';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private currentThemeSubject = new BehaviorSubject<Theme>(this.getThemeById(DEFAULT_THEME_ID));
  public currentTheme$ = this.currentThemeSubject.asObservable();

  private adminThemeSubject = new BehaviorSubject<Theme>(this.getThemeById(DEFAULT_THEME_ID));
  public adminTheme$ = this.adminThemeSubject.asObservable();

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeTheme();
      this.router.events
        .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
        .subscribe(() => this.syncThemeToCurrentArea());
    }
  }

  private initializeTheme(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const isAdminArea = window.location.pathname.startsWith('/admin');

    const frontendId = this.normalizeStoredThemeId(
      localStorage.getItem('selected-theme'),
      'frontend'
    );
    const frontendTheme = this.getThemeById(frontendId);
    this.currentThemeSubject.next(frontendTheme);
    localStorage.setItem('selected-theme', frontendTheme.id);

    const adminId = this.normalizeStoredThemeId(
      localStorage.getItem('selected-theme-admin') || localStorage.getItem('adminTheme'),
      'admin'
    );
    const adminTheme = this.getThemeById(adminId, 'admin');
    this.adminThemeSubject.next(adminTheme);
    localStorage.setItem('selected-theme-admin', adminTheme.id);

    if (isAdminArea) {
      document.body.classList.add('is-admin');
      this.applyTheme(adminTheme, 'admin');
    } else {
      document.body.classList.remove('is-admin');
      this.applyTheme(frontendTheme, 'frontend');
    }
  }

  /** Re-apply the theme for the current route (fixes admin theme leaking to storefront). */
  syncThemeToCurrentArea(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const isAdminArea = this.router.url.startsWith('/admin');
    if (isAdminArea) {
      this.applyTheme(this.getCurrentAdminTheme(), 'admin');
    } else {
      this.applyTheme(this.getCurrentTheme(), 'frontend');
    }
  }

  getDomThemeId(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    return document.documentElement.getAttribute('data-theme');
  }

  private normalizeStoredThemeId(themeId: string | null, area: Area): string {
    if (!themeId) {
      return DEFAULT_THEME_ID;
    }
    return this.resolveThemeId(themeId, area);
  }

  private resolveThemeId(themeId: string, area: Area): string {
    if (themeId === 'default') {
      return 'light';
    }
    if (area === 'frontend') {
      if (themeId === 'dark-glass') {
        return 'dark';
      }
      const frontendIds = this.getThemesByArea('frontend').map(t => t.id);
      if (!frontendIds.includes(themeId)) {
        return DEFAULT_THEME_ID;
      }
    }
    return themeId;
  }

  getThemeById(themeId: string, area: Area = 'frontend'): Theme {
    const resolvedId = this.resolveThemeId(themeId, area);
    return AVAILABLE_THEMES.find(theme => theme.id === resolvedId) ||
      AVAILABLE_THEMES.find(theme => theme.id === DEFAULT_THEME_ID) ||
      AVAILABLE_THEMES[0];
  }

  /**
   * Returns themes filtered by area.
   * Frontend: 3 themes (light, dark, glass)
   * Admin: 4 themes (light, dark, glass, dark-glass)
   */
  getThemesByArea(area: Area): Theme[] {
    if (area === 'frontend') {
      return AVAILABLE_THEMES.filter(t => t.id !== 'dark-glass');
    }
    return AVAILABLE_THEMES;
  }

  setTheme(themeId: string, area: Area = 'frontend'): void {
    const resolvedId = this.resolveThemeId(themeId, area);
    const theme = this.getThemeById(resolvedId, area);

    if (isPlatformBrowser(this.platformId)) {
      const storageKey = area === 'admin' ? 'selected-theme-admin' : 'selected-theme';
      localStorage.setItem(storageKey, theme.id);
      if (area === 'admin') {
        localStorage.setItem('adminTheme', themeId); // Compatibility with old key
      }
    }

    if (area === 'admin') {
      this.adminThemeSubject.next(theme);
    } else {
      this.currentThemeSubject.next(theme);
    }

    this.applyTheme(theme, area);
  }

  private applyTheme(theme: Theme, area: Area = 'frontend'): void {
    if (!theme || !theme.id || !isPlatformBrowser(this.platformId)) {
      return;
    }

    const domThemeId = this.resolveThemeId(theme.id, area);
    document.documentElement.setAttribute('data-theme', domThemeId);
    document.body.setAttribute('data-theme', domThemeId);
  }

  getCurrentTheme(): Theme {
    return this.currentThemeSubject.value;
  }

  getCurrentAdminTheme(): Theme {
    return this.adminThemeSubject.value;
  }

  toggleAdminTheme(): void {
    const adminThemes = this.getThemesByArea('admin');
    const current = this.getCurrentAdminTheme();
    const currentIndex = adminThemes.findIndex(t => t.id === current.id);
    const nextIndex = (currentIndex + 1) % adminThemes.length;
    const nextTheme = adminThemes[nextIndex];
    this.setTheme(nextTheme.id, 'admin');
  }
}
