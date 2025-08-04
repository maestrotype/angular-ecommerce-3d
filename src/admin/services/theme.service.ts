import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type AdminTheme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private themeSubject = new BehaviorSubject<AdminTheme>('dark');
  public theme$ = this.themeSubject.asObservable();

  constructor() {
    this.loadTheme();
  }

  private loadTheme(): void {
    const savedTheme = localStorage.getItem('admin-theme') as AdminTheme;
    if (savedTheme) {
      this.setTheme(savedTheme);
    } else {
      this.setTheme('dark');
    }
    
    const body = document.body;
    const currentTheme = this.getCurrentTheme();
    body.setAttribute('data-theme', currentTheme);
  }

  getCurrentTheme(): AdminTheme {
    return this.themeSubject.value;
  }

  setTheme(theme: AdminTheme): void {
    this.themeSubject.next(theme);
    localStorage.setItem('admin-theme', theme);
    
    const body = document.body;
    body.setAttribute('data-theme', theme);
  }

  toggleTheme(): void {
    const currentTheme = this.getCurrentTheme();
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  isDarkTheme(): boolean {
    return this.getCurrentTheme() === 'dark';
  }

  isLightTheme(): boolean {
    return this.getCurrentTheme() === 'light';
  }
} 