import {
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

@Component({
  selector: 'app-section-renderer',
  templateUrl: './section-renderer.component.html',
  styleUrls: ['./section-renderer.component.scss']
})
export class SectionRendererComponent implements OnInit, OnChanges, OnDestroy {
  @Input() section: any;
  @Input() mode: 'desktop' | 'tablet' | 'mobile' = 'desktop';
  @ViewChild('container', { read: ViewContainerRef, static: true }) container!: ViewContainerRef;
  private isRendering = false;
  private isDestroyed = false;

  ngOnInit() {
    this.renderSection();
  }

  ngOnChanges(changes: SimpleChanges) {
    if ((changes['section'] && !changes['section'].firstChange) || 
        (changes['mode'] && !changes['mode'].firstChange)) {
      this.renderSection();
    }
  }

  async renderSection() {
    if (!this.section || !this.container || this.isRendering || this.isDestroyed) return;
    
    this.isRendering = true;
    try {
      this.container.clear();
      const loader = sectionComponentMap[this.section?.type];
      if (loader) {
        const componentType = await loader();
        
        // Safety check after await
        if (this.isDestroyed || !this.container) return;

        const componentRef = this.container.createComponent(componentType);
        
        const dataWithMode = { 
          ...this.section, 
          previewMode: this.mode 
        };

        if ('data' in componentRef.instance) {
          componentRef.instance.data = dataWithMode;
        }
        
        componentRef.changeDetectorRef.markForCheck();
        componentRef.changeDetectorRef.detectChanges();
      }
    } finally {
      this.isRendering = false;
    }
  }

  ngOnDestroy(): void {
    this.isDestroyed = true;
  }
}