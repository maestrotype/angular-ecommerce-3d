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
    // Clear any data-theme from both html and body immediately (from admin)
    document.documentElement.removeAttribute('data-theme');
    document.body.removeAttribute('data-theme');
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

    // Clear any conflicting data-theme attributes from both html and body (from admin)
    document.documentElement.removeAttribute('data-theme');
    document.body.removeAttribute('data-theme');
    
    // Set data-theme attribute for CSS selectors
    root.setAttribute('data-theme', theme.id);

    // IMPORTANT: Clear data-theme from body AFTER setting it on html
    // This prevents body from overriding html theme
    document.body.removeAttribute('data-theme');
  }

  getCurrentTheme(): Theme {
    return this.currentThemeSubject.value;
  }
} 