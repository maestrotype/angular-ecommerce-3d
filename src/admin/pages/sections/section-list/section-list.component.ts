import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { SectionService } from '../../../services/section.service';
import { SectionFormComponent } from '../section-form/section-form.component';
import { Section } from '../../../models/section.model';
import { MatSidenav } from '@angular/material/sidenav';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-section-list',
  templateUrl: './section-list.component.html',
  styleUrls: ['./section-list.component.scss'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0, transform: 'translateY(10px)' }))
      ])
    ])
  ]
})
export class SectionListComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['order', 'type', 'title', 'isActive', 'createdAt', 'actions'];
  dataSource = new MatTableDataSource<Section>();
  loading = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  isEditorOpen = false;
  editingSection: Section | null = null;
  editorMode: 'add' | 'edit' = 'add';
  showPicker = false;
  activeMenuLang: 'en' | 'ru' | 'ua' = 'en';
  previewData: any = null;
  selectedPreviewSection: Section | null = null;
  previewMode: 'desktop' | 'tablet' | 'mobile' | 'fold' = 'desktop';
  themeMode: 'light' | 'dark' | 'dark-glass' = 'dark-glass';
  selectedElementInfo: { selector: string, section: any } | null = null;
  sidebarWidth = 540;
  private isResizing = false;
  private initialMouseX = 0;
  private initialSidebarWidth = 540;

  constructor(
    private sectionService: SectionService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadSections();
    this.initResizeListeners();
  }

  private initResizeListeners(): void {
    window.addEventListener('mousemove', (e) => this.onMouseMove(e));
    window.addEventListener('mouseup', () => this.onMouseUp());
  }

  onMouseDown(event: MouseEvent): void {
    this.isResizing = true;
    this.initialMouseX = event.clientX;
    this.initialSidebarWidth = this.sidebarWidth;
    document.body.classList.add('resizing-active');
    event.preventDefault();
  }

  private onMouseMove(event: MouseEvent): void {
    if (!this.isResizing) return;
    
    // Smooth frame-based update
    requestAnimationFrame(() => {
      const deltaX = event.clientX - this.initialMouseX;
      const newWidth = this.initialSidebarWidth + deltaX;
      if (newWidth > 300 && newWidth < 1200) {
        this.sidebarWidth = newWidth;
      }
    });
  }

  private onMouseUp(): void {
    if (this.isResizing) {
      this.isResizing = false;
      document.body.classList.remove('resizing-active');
    }
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadSections(onLoaded?: () => void): void {
    this.loading = true;
    this.sectionService.getSections().subscribe({
      next: (sections) => {
        // Spread to force a new array reference → triggers ngOnChanges in child components
        this.dataSource.data = [...sections];
        this.loading = false;
        if (onLoaded) onLoaded();
      },
        error: (error) => {
          this.loading = false;
          const errorMsg = error?.status === 500
            ? this.translate.instant('SERVER_ERROR_LOGS_MSG')
            : this.translate.instant('FAILED_TO_LOAD_SECTIONS');
            
          this.snackBar.open(errorMsg, this.translate.instant('CLOSE_BTN'), { duration: 5000 });
        }
    });
  }

  selectForPreview(section: Section): void {
    if (this.isEditorOpen) return;
    this.selectedPreviewSection = this.selectedPreviewSection?.id === section.id ? null : section;
  }

  addSection(): void {
    this.editorMode = 'add';
    this.editingSection = null;
    this.showPicker = true;
    this.previewData = null;
    this.isEditorOpen = true;
  }

  onSectionTypeSelected(type: string): void {
    this.showPicker = false;
    this.editingSection = { type } as any; // Temporary object for form
    this.previewData = { type };
  }

  editSection(section: Section): void {
    this.editorMode = 'edit';
    this.editingSection = section;
    this.showPicker = false;
    this.previewData = { ...section };
    this.selectedPreviewSection = null; // Close main preview if editing
    this.isEditorOpen = true;
  }

  onFormChanged(data: any): void {
    // Merge into existing previewData to preserve server fields like `id`
    this.previewData = { ...this.previewData, ...data };
    
    // Live update the section in the main list so Architect view reflects changes
    if (this.editingSection && this.editingSection.id) {
      const dataIndex = this.dataSource.data.findIndex(s => s.id === this.editingSection?.id);
      if (dataIndex > -1) {
        const updatedData = [...this.dataSource.data];
        updatedData[dataIndex] = { ...updatedData[dataIndex], ...data };
        this.dataSource.data = updatedData;
      }
    }
  }

  onFormSaved(): void {
    // Reload first, THEN close editor so the preview updates with fresh data
    this.loadSections(() => {
      this.closeEditor();
    });
  }

  closeEditor(): void {
    this.isEditorOpen = false;
    this.editingSection = null;
    this.previewData = null;
  }

  toggleSection(section: Section): void {
    this.sectionService.toggleSection(section.id).subscribe({
      next: () => {
        const msg = section.isActive ? 'SECTION_DEACTIVATED' : 'SECTION_ACTIVATED';
        this.snackBar.open(this.translate.instant(msg), this.translate.instant('CLOSE_BTN'), { duration: 3000 });
        this.loadSections();
      },
      error: (error) => {
        this.snackBar.open(this.translate.instant('ERROR_UPDATING_SECTION'), this.translate.instant('CLOSE_BTN'), { duration: 3000 });
      }
    });
  }

  deleteSection(section: Section): void {
    if (confirm('Are you sure you want to delete this section?')) {
      this.sectionService.deleteSection(section.id).subscribe({
        next: () => {
          this.snackBar.open(this.translate.instant('SECTION_DELETED_SUCCESSFULLY'), this.translate.instant('CLOSE_BTN'), { duration: 3000 });
          this.loadSections();
        },
        error: (error) => {
          this.snackBar.open(this.translate.instant('ERROR_DELETING_SECTION'), this.translate.instant('CLOSE_BTN'), { duration: 3000 });
        }
      });
    }
  }

  drop(event: CdkDragDrop<Section[]>): void {
    const data = [...this.dataSource.data];
    moveItemInArray(data, event.previousIndex, event.currentIndex);
    this.updateSectionOrder(data);
  }

  onPreviewReorder(newSections: Section[]): void {
    this.updateSectionOrder(newSections);
  }

  private updateSectionOrder(data: Section[]): void {
    this.dataSource.data = [...data];
    const sectionIds = data.map(section => section.id);
    this.sectionService.reorderSections(sectionIds).subscribe({
      next: (sections) => {
        this.dataSource.data = sections;
        this.snackBar.open(this.translate.instant('SECTIONS_REORDERED'), this.translate.instant('CLOSE_BTN'), { duration: 3000 });
      },
      error: () => {
        this.snackBar.open(this.translate.instant('ERROR_REORDERING_SECTIONS'), this.translate.instant('CLOSE_BTN'), { duration: 3000 });
        this.loadSections();
      }
    });
  }

  setPreviewMode(mode: 'desktop' | 'tablet' | 'mobile' | 'fold'): void {
    this.previewMode = mode;
    this.selectedElementInfo = null;
  }

  setThemeMode(theme: 'light' | 'dark' | 'dark-glass'): void {
    this.themeMode = theme;
  }

  onElementSelected(info: any): void {
    this.selectedElementInfo = info;
  }

  updateVisualOverride(property: string, delta: number|string): void {
    if (!this.selectedElementInfo) return;

    const { selector, section } = this.selectedElementInfo;
    const settings = JSON.parse(JSON.stringify(section.settings || {}));
    if (!settings.visualOverrides) settings.visualOverrides = { viewports: {}, themes: {} };

    // Support both numeric delta and direct value
    if (typeof delta === 'number') {
        const viewports = settings.visualOverrides.viewports;
        if (!viewports[this.previewMode]) viewports[this.previewMode] = {};
        if (!viewports[this.previewMode][selector]) viewports[this.previewMode][selector] = {};
        
        let currentVal = parseInt(viewports[this.previewMode][selector][property] || '0');
        viewports[this.previewMode][selector][property] = `${currentVal + delta}px`;
    }

    section.settings = settings;
    this.saveVisualOverride(section);
  }

  updateColorOverride(color: string): void {
    if (!this.selectedElementInfo) return;

    const { selector, section } = this.selectedElementInfo;
    const settings = JSON.parse(JSON.stringify(section.settings || {}));
    if (!settings.visualOverrides) settings.visualOverrides = { viewports: {}, themes: {} };

    const themes = settings.visualOverrides.themes;
    if (!themes[this.themeMode]) themes[this.themeMode] = {};
    if (!themes[this.themeMode][selector]) themes[this.themeMode][selector] = {};
    
    themes[this.themeMode][selector]['color'] = color;

    settings.visualOverrides = { ...settings.visualOverrides, themes };
    section.settings = settings;
    this.saveVisualOverride(section);
  }

  private saveVisualOverride(section: any): void {
    this.sectionService.updateSection(section.id, { settings: section.settings }).subscribe({
      next: () => {
        this.dataSource.data = this.dataSource.data.map(s => s.id === section.id ? { ...section } : s);
        
        // IMPORTANT: Sync local state so when the open form is submitted it doesn't overwrite these overrides
        if (this.editingSection && this.editingSection.id === section.id) {
          this.editingSection = { ...this.editingSection, settings: section.settings };
        }
        if (this.previewData && this.previewData.id === section.id) {
          this.previewData = { ...this.previewData, settings: section.settings };
        }
      }
    });
  }
}