import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ViewContainerRef,
  Type,
  OnDestroy
} from '@angular/core';

import { sectionComponentMap } from './section-map';
import { getSectionAnchorId } from 'src/shared/utils/section-anchor.util';

import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-section-renderer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './section-renderer.component.html',
  styleUrls: ['./section-renderer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class SectionRendererComponent implements OnInit, OnChanges, OnDestroy {
  @Input() section: any;
  @Input() mode: 'desktop' | 'tablet' | 'mobile' = 'desktop';
  @Input() contextData: any = null; // New logic for page-specific data
  @Input() refreshKey: any = null; // Force full re-render when this changes
  @ViewChild('container', { read: ViewContainerRef, static: true }) container!: ViewContainerRef;
  private styleTag?: HTMLStyleElement;
  private isRendering = false;
  private pendingRender = false;
  private isDestroyed = false;

  ngOnInit() {
    this.renderSection();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['refreshKey'] && !changes['refreshKey'].firstChange) {
      // Force full re-render by resetting previous type
      this.previousType = '';
    }
    if ((changes['section'] && !changes['section'].firstChange) ||
        (changes['mode'] && !changes['mode'].firstChange) ||
        (changes['refreshKey'] && !changes['refreshKey'].firstChange) ||
        (changes['contextData'] && !changes['contextData'].firstChange)) {
      if (changes['section'] || changes['refreshKey']) {
        this.renderSection();
      } else if (this.componentRef) {
        this.updateComponentState();
      }
    }
  }

  private componentRef: any;
  private previousType: string = '';

  async renderSection() {
    if (!this.section || !this.container || this.isDestroyed) return;
    if (this.isRendering) {
      this.pendingRender = true;
      return;
    }
    
    // If the type hasn't changed, we can just update the existing component
    if (this.componentRef && this.section.type === this.previousType) {
      this.updateComponentState();
      return;
    }

    this.isRendering = true;
    try {
      this.container.clear();
      const loader = sectionComponentMap[this.section?.type];
      if (loader) {
        const componentType = await loader();
        
        if (this.isDestroyed || !this.container) return;

        this.componentRef = this.container.createComponent(componentType);
        this.previousType = this.section.type;
        
        this.updateComponentState();
      }
    } catch (err) {
      console.error('Section renderer failed for type:', this.section?.type, err);
    } finally {
      this.isRendering = false;
      if (this.pendingRender && !this.isDestroyed) {
        this.pendingRender = false;
        void this.renderSection();
      }
    }
  }

  private updateComponentState() {
    if (!this.componentRef) return;

    const dataWithMode = { 
      ...this.section, 
      previewMode: this.mode,
      context: this.contextData 
    };

    if ('data' in this.componentRef.instance) {
      this.componentRef.instance.data = dataWithMode;
    }

    // Manage Variant Classes
    const element = this.componentRef.location.nativeElement;
    
    // Remove all variant classes first
    const classes = Array.from(element.classList) as string[];
    classes.forEach(c => {
      if (c.startsWith('variant-')) element.classList.remove(c);
    });

    if (this.section.variant && this.section.variant !== 'default') {
      element.classList.add(`variant-${this.section.variant}`);
    }

    this.componentRef.changeDetectorRef.markForCheck();
    this.componentRef.changeDetectorRef.detectChanges();
    
    // Inject dynamic overrides
    this.applyVisualOverrides();
  }

  private applyVisualOverrides(): void {
    const overrides = this.section?.settings?.visualOverrides;
    if (!overrides || !this.section.id) {
      this.removeStyles();
      return;
    }

    const sectionId = getSectionAnchorId(this.section) || (this.section.id ? `section-${this.section.id}` : '');
    let css = '';

    // 1. Process Viewports (Media Queries)
    const viewports = overrides.viewports || {};
    if (viewports.desktop) css += this.generateSelectorStyles(`#${sectionId}`, viewports.desktop);
    if (viewports.tablet) css += `@media (max-width: 991px) { ${this.generateSelectorStyles(`#${sectionId}`, viewports.tablet)} }\n`;
    if (viewports.mobile) css += `@media (max-width: 575px) { ${this.generateSelectorStyles(`#${sectionId}`, viewports.mobile)} }\n`;

    // 2. Process Themes (architect stores "default"; storefront DOM uses "light")
    const themes = overrides.themes || {};
    Object.keys(themes).forEach(theme => {
      this.domThemeAttrs(theme).forEach(attr => {
        const themeSelector = `[data-theme="${attr}"] #${sectionId}#${sectionId}`;
        css += this.generateSelectorStyles(themeSelector, themes[theme]);
      });
    });

    if (css) {
      if (!this.styleTag) {
        this.styleTag = document.createElement('style');
        this.styleTag.id = `dynamic-styles-${this.section.id}`;
        document.head.appendChild(this.styleTag);
      }
      this.styleTag.textContent = css;
    } else {
      this.removeStyles();
    }
  }

  private domThemeAttrs(theme: string): string[] {
    if (theme === 'default' || theme === 'light') {
      return ['light', 'default'];
    }
    return [theme];
  }

  private generateSelectorStyles(baseSelector: string, selectorMap: any): string {
    let styles = '';
    Object.keys(selectorMap).forEach(selector => {
      const rules = selectorMap[selector];
      let ruleStr = '';
      Object.keys(rules).forEach(prop => {
        // Removed !important as requested by user. We use a double-ID selector 
        // to boost specificity (0,2,0) so it overcomes local component classes (0,1,0) naturally.
        ruleStr += `  ${prop}: ${rules[prop]};\n`;
      });
      if (ruleStr) {
        styles += `${baseSelector} ${selector} {\n${ruleStr}}\n`;
      }
    });
    return styles;
  }

  private removeStyles(): void {
    if (this.styleTag) {
      this.styleTag.remove();
      this.styleTag = undefined;
    }
  }

  ngOnDestroy(): void {
    this.isDestroyed = true;
    this.removeStyles();
  }

  get wrapperId(): string {
    return getSectionAnchorId(this.section);
  }
}