import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
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
  previewingTheme: Theme | null = null;
  isHovering = false;
  private destroy$ = new Subject<void>();
  private hoverTimeout: any;
  private drawerContent?: HTMLElement;

  constructor(private themeService: ThemeService) { }

  ngOnInit(): void {
    this.themes = this.themeService.getAllThemes();

    this.themeService.currentTheme$
      .pipe(takeUntil(this.destroy$))
      .subscribe(theme => {
        this.currentTheme = theme;
      });
  }

  ngAfterViewInit() {
    this.drawerContent = document.querySelector('.mat-drawer-content') as HTMLElement;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
    }
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    this.hidePreview();
  }

  selectTheme(themeId: string): void {
    this.themeService.setTheme(themeId);
  }

  getMiniPreviewStyle(theme: Theme): any {
    return {
      '--preview-primary': theme.colors.primary,
      '--preview-secondary': theme.colors.secondary,
      '--preview-accent': theme.colors.accent,
      '--preview-bg': theme.colors['bg-primary'],
      '--preview-surface': theme.colors['surface-primary'],
      '--preview-text': theme.colors['text-primary'],
      '--preview-blur': theme.id.includes('glass') ? '10px' : '0px'
    };
  }

  showPreview(theme: Theme, immediate: boolean = false): void {
    console.log('showPreview called', theme.name, 'immediate:', immediate);

    // If modal is open and we're hovering over a different theme, close it first
    if (this.previewingTheme && this.previewingTheme.id !== theme.id && !immediate) {
      this.previewingTheme = null;
      return;
    }

    this.isHovering = true;

    // Clear any existing timeout
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
    }

    // If immediate (click), show right away
    if (immediate) {
      this.previewingTheme = theme;
      console.log('Showing preview immediately');
      if (this.drawerContent) {
        this.drawerContent.style.zIndex = '2';
      }
      return;
    }

    // Otherwise debounce for hover
    this.hoverTimeout = setTimeout(() => {
      if (this.isHovering) {
        this.previewingTheme = theme;
        console.log('Showing preview after debounce');
      }
    }, 300);
  }

  hidePreview(): void {
    console.log('hidePreview called');
    this.isHovering = false;
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
    }
    this.previewingTheme = null;
    if (this.drawerContent) {
      this.drawerContent.style.zIndex = '1';
    }
    console.log('Preview hidden, previewingTheme:', this.previewingTheme);
  }

  onModalBackdropClick(): void {
    console.log('Backdrop clicked, closing modal');
    this.hidePreview();
  }

  getMainColors(theme: Theme): Array<{ name: string, label: string, value: string }> {
    return [
      { name: 'Primary', label: 'P', value: theme.colors.primary },
      { name: 'Secondary', label: 'S', value: theme.colors.secondary },
      { name: 'Accent', label: 'A', value: theme.colors.accent },
      { name: 'Background', label: 'BG', value: theme.colors['bg-primary'] },
      { name: 'Surface', label: 'SF', value: theme.colors['surface-primary'] },
      { name: 'Success', label: '✓', value: theme.colors.success },
      { name: 'Warning', label: '⚠', value: theme.colors.warning },
      { name: 'Error', label: '✕', value: theme.colors.error }
    ];
  }

  applyAndClose(theme: Theme): void {
    this.selectTheme(theme.id);
    this.hidePreview();
  }
} 