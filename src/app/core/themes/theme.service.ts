import { Injectable, PLATFORM_ID, Inject, afterNextRender } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable, map } from 'rxjs';
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

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeTheme();
    }
  }

  private initializeTheme(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Load frontend theme
    const savedFrontend = localStorage.getItem('selected-theme');
    const frontendTheme = savedFrontend ? this.getThemeById(savedFrontend) : this.getThemeById(DEFAULT_THEME_ID);
    this.currentThemeSubject.next(frontendTheme);
    this.applyTheme(frontendTheme, 'frontend');

    // Load admin theme
    const savedAdmin = localStorage.getItem('selected-theme-admin') || localStorage.getItem('adminTheme');
    const adminTheme = savedAdmin ? this.getThemeById(savedAdmin) : this.getThemeById(DEFAULT_THEME_ID);
    this.adminThemeSubject.next(adminTheme);
    this.applyTheme(adminTheme, 'admin');
  }

  getThemeById(themeId: string): Theme {
    return AVAILABLE_THEMES.find(theme => theme.id === themeId) ||
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
    const theme = this.getThemeById(themeId);

    if (isPlatformBrowser(this.platformId)) {
      const storageKey = area === 'admin' ? 'selected-theme-admin' : 'selected-theme';
      localStorage.setItem(storageKey, themeId);
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

    const themeId = theme.id;

    // Apply to both for maximum compatibility, but prioritize area logic if needed
    document.documentElement.setAttribute('data-theme', themeId);
    document.body.setAttribute('data-theme', themeId);
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
