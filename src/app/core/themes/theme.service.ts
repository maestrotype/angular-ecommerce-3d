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
    console.log('ThemeService initialized');
    this.initializeTheme();
  }

  private initializeTheme(): void {
    const savedThemeId = localStorage.getItem('selected-theme');
    console.log('Initializing theme, saved theme ID:', savedThemeId);
    
    if (savedThemeId) {
      const theme = this.getThemeById(savedThemeId);
      if (theme) {
        console.log('Applying saved theme:', theme.name);
        this.setTheme(theme.id);
      }
    } else {
      console.log('No saved theme, applying default:', DEFAULT_THEME_ID);
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
    console.log('Setting theme:', themeId);
    const theme = this.getThemeById(themeId);
    if (theme) {
      console.log('Applying theme:', theme.name);
      this.currentThemeSubject.next(theme);
      this.applyTheme(theme);
      localStorage.setItem('selected-theme', themeId);
    }
  }

  private applyTheme(theme: Theme): void {
    console.log('Applying theme to document:', theme.name);
    const root = document.documentElement;

    // Set data-theme attribute for CSS selectors
    root.setAttribute('data-theme', theme.id);
    console.log(`Set data-theme = ${theme.id}`);

    // Apply colors
    Object.entries(theme.colors).forEach(([key, value]) => {
      if (typeof value === 'object') {
        Object.entries(value).forEach(([subKey, subValue]) => {
          const cssVar = `--color-${key}-${subKey}`;
          root.style.setProperty(cssVar, subValue.toString());
          console.log(`Set ${cssVar} = ${subValue}`);
        });
      } else {
        const cssVar = `--color-${key}`;
        root.style.setProperty(cssVar, value.toString());
        console.log(`Set ${cssVar} = ${value}`);
      }
    });

    // Apply layout
    Object.entries(theme.layout).forEach(([key, value]) => {
      if (typeof value === 'object') {
        Object.entries(value).forEach(([subKey, subValue]) => {
          if (typeof subValue === 'object') {
            Object.entries(subValue).forEach(([subSubKey, subSubValue]) => {
              const cssVar = `--layout-${key}-${subKey}-${subSubKey}`;
              root.style.setProperty(cssVar, subSubValue.toString());
              console.log(`Set ${cssVar} = ${subSubValue}`);
            });
          } else {
            const cssVar = `--layout-${key}-${subKey}`;
            root.style.setProperty(cssVar, subValue.toString());
            console.log(`Set ${cssVar} = ${subValue}`);
          }
        });
      } else {
        const cssVar = `--layout-${key}`;
        root.style.setProperty(cssVar, value.toString());
        console.log(`Set ${cssVar} = ${value}`);
      }
    });

    // Apply components
    Object.entries(theme.components).forEach(([key, value]) => {
      if (typeof value === 'object') {
        Object.entries(value).forEach(([subKey, subValue]) => {
          if (typeof subValue === 'object') {
            Object.entries(subValue).forEach(([subSubKey, subSubValue]) => {
              const cssVar = `--component-${key}-${subKey}-${subSubKey}`;
              root.style.setProperty(cssVar, subSubValue.toString());
              console.log(`Set ${cssVar} = ${subSubValue}`);
            });
          } else {
            const cssVar = `--component-${key}-${subKey}`;
            root.style.setProperty(cssVar, subValue.toString());
            console.log(`Set ${cssVar} = ${subValue}`);
          }
        });
      } else {
        const cssVar = `--component-${key}`;
        root.style.setProperty(cssVar, value.toString());
        console.log(`Set ${cssVar} = ${value}`);
      }
    });
    
    console.log('Theme application completed');
  }

  getCurrentTheme(): Theme {
    return this.currentThemeSubject.value;
  }
} 