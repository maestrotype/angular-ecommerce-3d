import { Component, Input, OnChanges, SimpleChanges, HostBinding } from '@angular/core';

@Component({
  selector: 'app-admin-section-preview',
  templateUrl: './admin-section-preview.component.html',
  styleUrls: ['./admin-section-preview.component.scss']
})
export class AdminSectionPreviewComponent implements OnChanges {
  @Input() sectionData: any;
  @Input() sections: any[] = [];
  @Input() activeSectionId: string | null = null;
  @Input() mode: 'desktop' | 'tablet' | 'mobile' = 'desktop';

  @HostBinding('attr.data-mode') get dataMode() { return this.mode; }
  @HostBinding('class.force-desktop') get forceDesktop() { return this.mode === 'desktop'; }
  @HostBinding('class.mode-tablet') get modeTablet() { return this.mode === 'tablet'; }
  @HostBinding('class.mode-mobile') get modeMobile() { return this.mode === 'mobile'; }
  
  // We use a counter to force re-render if needed
  renderKey = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['sectionData'] || changes['sections']) {
      this.renderKey++;
    }
  }
}
