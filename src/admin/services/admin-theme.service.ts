import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type AdminTheme = 'light' | 'dark' | 'glass';

@Injectable({
  providedIn: 'root'
})
export class AdminThemeService {
  private currentThemeSubject = new BehaviorSubject<AdminTheme>('dark');
  public currentTheme$ = this.currentThemeSubject.asObservable();

  constructor() {
    // Load saved theme or default to dark
    const savedTheme = localStorage.getItem('admin-theme') as AdminTheme;
    if (savedTheme && ['light', 'dark', 'glass'].includes(savedTheme)) {
      this.setTheme(savedTheme);
    } else {
      this.setTheme('dark');
    }
  }

  getCurrentTheme(): AdminTheme {
    return this.currentThemeSubject.value;
  }

  setTheme(theme: AdminTheme): void {
    console.log('Setting admin theme:', theme);
    this.currentThemeSubject.next(theme);
    
    // Apply theme to document
    document.documentElement.setAttribute('data-admin-theme', theme);
    
    // Save to localStorage
    localStorage.setItem('admin-theme', theme);
  }

  toggleTheme(): void {
    const current = this.getCurrentTheme();
    const themes: AdminTheme[] = ['light', 'dark', 'glass'];
    const currentIndex = themes.indexOf(current);
    const nextIndex = (currentIndex + 1) % themes.length;
    this.setTheme(themes[nextIndex]);
  }

  getThemeIcon(): string {
    switch (this.getCurrentTheme()) {
      case 'light': return 'light_mode';
      case 'dark': return 'dark_mode';
      case 'glass': return 'blur_on';
      default: return 'dark_mode';
    }
  }

  getThemeTooltip(): string {
    switch (this.getCurrentTheme()) {
      case 'light': return 'Switch to Dark Theme';
      case 'dark': return 'Switch to Glass Theme';
      case 'glass': return 'Switch to Light Theme';
      default: return 'Switch Theme';
    }
  }
} 