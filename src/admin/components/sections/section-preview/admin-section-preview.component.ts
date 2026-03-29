import { Component, Input, OnChanges, SimpleChanges, HostBinding, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-admin-section-preview',
  templateUrl: './admin-section-preview.component.html',
  styleUrls: ['./admin-section-preview.component.scss']
})
export class AdminSectionPreviewComponent implements OnChanges {
  @Input() sectionData: any;
  @Input() sections: any[] = [];
  @Input() activeSectionId: number | null = null;
  @Input() isEditorMode = false; // New flag to force editor-specific styles
  @Input() mode: 'desktop' | 'tablet' | 'mobile' = 'desktop';
  @Output() sectionEdit = new EventEmitter<any>();

  @HostBinding('attr.data-mode') get dataMode() { return this.mode; }
  @HostBinding('class.force-desktop') get forceDesktop() { return this.mode === 'desktop'; }
  @HostBinding('class.mode-tablet') get modeTablet() { return this.mode === 'tablet'; }
  @HostBinding('class.mode-mobile') get modeMobile() { return this.mode === 'mobile'; }
  
  // We use a counter to force re-render if needed
  renderKey = 0;
  computedSections: any[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['sectionData'] || changes['sections']) {
      this.updateComputedSections();
      this.renderKey++;
    }
  }

  private updateComputedSections(): void {
    if (!this.sections) {
      this.computedSections = [];
      return;
    }

    if (!this.sectionData || !this.sectionData.id) {
      this.computedSections = this.sections;
      return;
    }

    // Only update if actually different to prevent unnecessary re-rendering
    this.computedSections = this.sections.map(s => 
      s.id === this.sectionData.id ? { ...s, ...this.sectionData } : s
    );
  }

  get renderingSections(): any[] {
    return this.computedSections;
  }

  onSectionClick(section: any, event: MouseEvent): void {
    if (!this.sections || this.sections.length === 0) return; // Only in architect mode
    event.stopPropagation();
    this.sectionEdit.emit(section);
  }
}
