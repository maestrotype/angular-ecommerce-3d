import { Injectable, PLATFORM_ID, Inject, afterNextRender } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { Theme } from './theme.model';
import { AVAILABLE_THEMES, DEFAULT_THEME_ID } from './theme-config';

type Area = 'frontend' | 'admin';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private currentThemeSubject = new BehaviorSubject<Theme>(this.getThemeById(DEFAULT_THEME_ID));
  public currentTheme$ = this.currentThemeSubject.asObservable();

  private adminThemeSubject = new BehaviorSubject<Theme | null>(null);
  public adminTheme$ = this.adminThemeSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    afterNextRender(() => {
      this.initializeTheme();
    });
  }

  private initializeTheme(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Load frontend theme
    const savedFrontend = localStorage.getItem('selected-theme');
    const frontendTheme = savedFrontend ? this.getThemeById(savedFrontend) : this.getThemeById(DEFAULT_THEME_ID);

    if (frontendTheme) {
      this.currentThemeSubject.next(frontendTheme);
      this.applyTheme(frontendTheme, 'frontend');
    }

    // Load admin theme
    const savedAdmin = localStorage.getItem('selected-theme-admin');
    if (savedAdmin) {
      const adminTheme = this.getThemeById(savedAdmin);
      if (adminTheme) {
        this.adminThemeSubject.next(adminTheme);
        this.applyTheme(adminTheme, 'admin');
      }
    }
  }

  getThemeById(themeId: string): Theme {
    return AVAILABLE_THEMES.find(theme => theme.id === themeId) || AVAILABLE_THEMES[0];
  }

  getAllThemes(): Theme[] {
    return AVAILABLE_THEMES;
  }

  setTheme(themeId: string, area: Area = 'frontend'): void {
    const theme = this.getThemeById(themeId);
    if (!theme) return;

    if (isPlatformBrowser(this.platformId)) {
      const storageKey = area === 'admin' ? 'selected-theme-admin' : 'selected-theme';
      localStorage.setItem(storageKey, themeId);
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

    const themeId = theme.id;

    if (area === 'admin') {
      document.body.setAttribute('data-admin-theme', themeId);
    } else {
      // For frontend, apply to both for maximum compatibility across different CSS selectors
      document.documentElement.setAttribute('data-theme', themeId);
      document.body.setAttribute('data-theme', themeId);
    }
  }

  getCurrentTheme(): Theme {
    return this.currentThemeSubject.value;
  }

  getCurrentAdminTheme(): Theme | null {
    return this.adminThemeSubject.value;
  }

  clearTheme(area: Area = 'frontend'): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (area === 'admin') {
      document.body.removeAttribute('data-admin-theme');
      localStorage.removeItem('selected-theme-admin');
      this.adminThemeSubject.next(null);
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.removeItem('selected-theme');
      const fallback = this.getThemeById(DEFAULT_THEME_ID);
      this.currentThemeSubject.next(fallback);
      this.applyTheme(fallback, 'frontend');
    }
  }
}
