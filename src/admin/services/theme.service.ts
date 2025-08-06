import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type AdminTheme = 'dark' | 'light';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private currentThemeSubject = new BehaviorSubject<AdminTheme>('dark');
  public currentTheme$: Observable<AdminTheme> = this.currentThemeSubject.asObservable();

  constructor() {
    this.loadTheme();
  }

  private loadTheme(): void {
    const savedTheme = localStorage.getItem('admin-theme') as AdminTheme;
    if (savedTheme && (savedTheme === 'dark' || savedTheme === 'light')) {
      this.setTheme(savedTheme);
    } else {
      this.setTheme('dark');
    }
  }

  public setTheme(theme: AdminTheme): void {
    this.currentThemeSubject.next(theme);
    localStorage.setItem('admin-theme', theme);
    this.applyTheme(theme);
  }

  public getCurrentTheme(): AdminTheme {
    return this.currentThemeSubject.value;
  }

  public toggleTheme(): void {
    const currentTheme = this.getCurrentTheme();
    const newTheme: AdminTheme = currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
  }

  private applyTheme(theme: AdminTheme): void {
    const root = document.documentElement;
    
    if (theme === 'light') {
      root.setAttribute('data-theme', 'light');
    } else {
      root.setAttribute('data-theme', 'dark');
    }
  }
} 