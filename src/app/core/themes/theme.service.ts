import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Theme } from './theme.model';
import { AVAILABLE_THEMES, DEFAULT_THEME_ID } from './theme-config';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private currentThemeSubject = new BehaviorSubject<Theme>(this.getThemeById(DEFAULT_THEME_ID));
  public currentTheme$ = this.currentThemeSubject.asObservable();

  constructor() {
    this.initializeTheme();
  }

  private initializeTheme(): void {
    const savedThemeId = localStorage.getItem('selected-theme');
    
    if (savedThemeId) {
      const theme = this.getThemeById(savedThemeId);
      if (theme) {
        this.setTheme(theme.id);
      } else {
        this.setTheme(DEFAULT_THEME_ID);
      }
    } else {
      this.setTheme(DEFAULT_THEME_ID);
    }
  }

  getThemeById(themeId: string): Theme {
    return AVAILABLE_THEMES.find(theme => theme.id === themeId) || AVAILABLE_THEMES[0];
  }

  getAllThemes(): Theme[] {
    return AVAILABLE_THEMES;
  }

  setTheme(themeId: string): void {
    const theme = this.getThemeById(themeId);
    
    if (theme) {
      this.currentThemeSubject.next(theme);
      this.applyTheme(theme);
      localStorage.setItem('selected-theme', themeId);
    } else {
      console.error('Theme not found for ID:', themeId);
    }
  }

  private applyTheme(theme: Theme): void {
    const root = document.documentElement;

    // Set data-theme attribute for CSS selectors
    root.setAttribute('data-theme', theme.id);

    // Apply colors
    Object.entries(theme.colors).forEach(([key, value]) => {
      const cssVar = `--color-${key}`;
      root.style.setProperty(cssVar, value.toString());
    });

    // Apply layout
    Object.entries(theme.layout).forEach(([key, value]) => {
      const cssVar = `--${key}`;
      root.style.setProperty(cssVar, value.toString());
    });

    // Apply components
    Object.entries(theme.components).forEach(([key, value]) => {
      const cssVar = `--${key}`;
      root.style.setProperty(cssVar, value.toString());
    });
  }

  getCurrentTheme(): Theme {
    return this.currentThemeSubject.value;
  }
} 