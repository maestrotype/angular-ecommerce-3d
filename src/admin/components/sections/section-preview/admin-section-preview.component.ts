import { Component, Input, OnChanges, SimpleChanges, HostBinding, Output, EventEmitter } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-admin-section-preview',
  templateUrl: './admin-section-preview.component.html',
  styleUrls: ['./admin-section-preview.component.scss']
})
export class AdminSectionPreviewComponent implements OnChanges {
  @Input() sectionData: any;
  @Input() sections: any[] = [];
  @Input() activeSectionId: number | null = null;
  @Input() isEditorMode = false;
  @Input() mode: 'desktop' | 'tablet' | 'mobile' | 'fold' = 'desktop';
  @Input() theme: 'light' | 'dark' | 'dark-glass' = 'dark-glass';
  @Output() sectionEdit = new EventEmitter<any>();
  @Output() reordered = new EventEmitter<any[]>();
  @Output() elementSelected = new EventEmitter<any>();

  isInspectionMode = false;
  hoveredElement: HTMLElement | null = null;
  selectedElement: any = null;
  selectedSelector: string | null = null;
  inspectorBox: any = null;
  isUnfolded = false;

  @HostBinding('attr.data-mode') get dataMode() { return this.mode; }
  @HostBinding('class.force-desktop') get forceDesktop() { return this.mode === 'desktop'; }
  @HostBinding('class.mode-tablet') get modeTablet() { return this.mode === 'tablet'; }
  @HostBinding('class.mode-mobile') get modeMobile() { return this.mode === 'mobile'; }
  @HostBinding('class.mode-fold') get modeFold() { return this.mode === 'fold'; }
  @HostBinding('class.unfolded') get isUnfoldedClass() { return this.isUnfolded; }
  
  renderKey = 0;
  computedSections: any[] = [];

  toggleUnfold() {
    this.isUnfolded = !this.isUnfolded;
  }

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

    this.computedSections = this.sections.map(s => 
      s.id === this.sectionData.id ? { ...s, ...this.sectionData } : s
    );
  }

  get renderingSections(): any[] {
    return this.computedSections;
  }

  onSectionClick(section: any, event: MouseEvent): void {
    if (!this.sections || this.sections.length === 0) return;
    if ((event.target as HTMLElement).closest('.drag-handle')) return;
    event.stopPropagation();
    this.sectionEdit.emit(section);
  }

  onDrop(event: CdkDragDrop<any[]>): void {
    const data = [...this.computedSections];
    moveItemInArray(data, event.previousIndex, event.currentIndex);
    this.computedSections = data;
    this.reordered.emit(data);
  }

  toggleInspectionMode(): void {
    this.isInspectionMode = !this.isInspectionMode;
    if (!this.isInspectionMode) {
      this.clearSelection();
    }
  }

  private clearSelection(): void {
    this.hoveredElement = null;
    this.selectedElement = null;
    this.selectedSelector = null;
    this.inspectorBox = null;
  }

  onPreviewMouseMove(event: MouseEvent): void {
    if (!this.isInspectionMode) return;
    event.stopPropagation();
    
    const target = event.target as HTMLElement;
    const sectionWrapper = target.closest('.architect-section-wrapper');
    if (!sectionWrapper) return;

    const renderer = sectionWrapper.querySelector('app-section-renderer');
    if (!renderer || !renderer.contains(target) || renderer === target) {
      this.hoveredElement = null;
      this.inspectorBox = null;
      return;
    }

    this.hoveredElement = target;
    this.selectedSelector = this.getBestSelector(target);
    this.updateInspectorBox(target);
  }

  onPreviewClick(event: MouseEvent): void {
    if (!this.isInspectionMode) return;
    event.stopPropagation();
    event.preventDefault();

    if (this.hoveredElement) {
      this.selectElement(this.hoveredElement);
    }
  }

  onPreviewDblClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const sectionWrapper = target.closest('.architect-section-wrapper');
    if (!sectionWrapper) return;

    const renderer = sectionWrapper.querySelector('app-section-renderer');
    if (!renderer || !renderer.contains(target) || renderer === target) return;

    event.stopPropagation();
    event.preventDefault();

    if (!this.isInspectionMode) {
      this.isInspectionMode = true;
    }
    
    this.selectElement(target);
  }

  private selectElement(el: HTMLElement): void {
    this.selectedElement = el;
    this.selectedSelector = this.getBestSelector(el);
    this.updateInspectorBox(el);
    
    const sectionWrapper = el.closest('.architect-section-wrapper');
    const sectionIdStr = sectionWrapper?.getAttribute('data-section-id');
    const section = this.computedSections.find(s => s.id.toString() === sectionIdStr);

    if (this.selectedSelector && section) {
      this.elementSelected.emit({ selector: this.selectedSelector, section });
    }
  }

  private updateInspectorBox(el: HTMLElement): void {
    const rect = el.getBoundingClientRect();
    this.inspectorBox = {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height
    };
  }

  private getBestSelector(el: HTMLElement): string {
    const classes = Array.from(el.classList).filter(c => !c.startsWith('ng-') && !c.includes('mat-'));
    if (classes.length > 0) return `.${classes[0]}`;
    return el.tagName.toLowerCase();
  }
}
