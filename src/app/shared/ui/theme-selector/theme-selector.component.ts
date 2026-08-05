import { Component, OnInit, OnDestroy, HostListener, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { ThemeDefinition } from '../../../core/themes/theme.model';
import { ThemeService } from '../../../core/themes/theme.service';

@Component({
  selector: 'app-theme-selector',
  templateUrl: './theme-selector.component.html',
  styleUrls: ['./theme-selector.component.scss']
})
export class ThemeSelectorComponent implements OnInit, OnDestroy {
  themes: ThemeDefinition[] = [];
  currentTheme: ThemeDefinition | null = null;
  previewingTheme: ThemeDefinition | null = null;
  isHovering = false;
  private destroy$ = new Subject<void>();
  private hoverTimeout: any;
  private drawerContent?: HTMLElement;

  constructor(
    private themeService: ThemeService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit(): void {
    this.themes = this.themeService.getThemesByArea('frontend');

    this.themeService.currentTheme$
      .pipe(takeUntil(this.destroy$))
      .subscribe(theme => {
        this.currentTheme = theme;
      });
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.drawerContent = document.querySelector('.mat-drawer-content') as HTMLElement;
    }
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

  getMiniPreviewStyle(theme: ThemeDefinition): Record<string, string> {
    const p = theme.preview;
    return {
      '--preview-primary': p.primary,
      '--preview-secondary': p.secondary,
      '--preview-accent': p.accent,
      '--preview-bg': p.background,
      '--preview-surface': p.surface,
      '--preview-text': p.text,
      '--preview-blur': p.glassBlur,
    };
  }

  showPreview(theme: ThemeDefinition, immediate: boolean = false): void {

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
      if (this.drawerContent) {
        this.drawerContent.style.zIndex = '2';
      }
      return;
    }

    this.hoverTimeout = setTimeout(() => {
      if (this.isHovering) {
        this.previewingTheme = theme;
      }
    }, 300);
  }

  hidePreview(): void {
    this.isHovering = false;
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
    }
    this.previewingTheme = null;
    if (this.drawerContent) {
      this.drawerContent.style.zIndex = '1';
    }
  }

  onModalBackdropClick(): void {
    this.hidePreview();
  }

  getMainColors(theme: ThemeDefinition): Array<{ name: string; label: string; value: string }> {
    const p = theme.preview;
    return [
      { name: 'Primary', label: 'P', value: p.primary },
      { name: 'Secondary', label: 'S', value: p.secondary },
      { name: 'Accent', label: 'A', value: p.accent },
      { name: 'Background', label: 'BG', value: p.background },
      { name: 'Surface', label: 'SF', value: p.surface },
      { name: 'Success', label: '✓', value: p.success },
      { name: 'Warning', label: '⚠', value: p.warning },
      { name: 'Error', label: '✕', value: p.error },
    ];
  }

  applyAndClose(theme: ThemeDefinition): void {
    this.selectTheme(theme.id);
    this.hidePreview();
  }
} 