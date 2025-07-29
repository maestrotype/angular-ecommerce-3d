import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { Theme } from '../../../core/themes/theme.model';
import { ThemeService } from '../../../core/themes/theme.service';

@Component({
  selector: 'app-theme-selector',
  templateUrl: './theme-selector.component.html',
  styleUrls: ['./theme-selector.component.scss']
})
export class ThemeSelectorComponent implements OnInit, OnDestroy {
  themes: Theme[] = [];
  currentTheme: Theme | null = null;
  private destroy$ = new Subject<void>();

  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    this.themes = this.themeService.getAllThemes();
    
    this.themeService.currentTheme$
      .pipe(takeUntil(this.destroy$))
      .subscribe(theme => {
        this.currentTheme = theme;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  selectTheme(themeId: string): void {
    this.themeService.setTheme(themeId);
  }

  getThemePreviewStyle(theme: Theme): any {
    return {
      background: theme.colors.primary,
      border: `2px solid ${theme.colors.accent}`
    };
  }
} 