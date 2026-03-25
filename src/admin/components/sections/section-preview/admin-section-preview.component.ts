import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-admin-section-preview',
  templateUrl: './admin-section-preview.component.html',
  styleUrls: ['./admin-section-preview.component.scss']
})
export class AdminSectionPreviewComponent implements OnChanges {
  @Input() sectionData: any;
  @Input() sections: any[] = [];
  @Input() activeSectionId: string | null = null; // New input for highlighting
  
  // We use a counter to force re-render if needed
  renderKey = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['sectionData'] || changes['sections']) {
      this.renderKey++;
    }
  }
}
