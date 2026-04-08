import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
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
  styleUrls: ['./section-list.component.scss']
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
  previewMode: 'desktop' | 'tablet' | 'mobile' = 'desktop';
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

  loadSections(): void {
    this.loading = true;
    this.sectionService.getSections().subscribe({
      next: (sections) => {
        this.dataSource.data = sections;
        this.loading = false;
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
    this.previewData = data;
  }

  onFormSaved(): void {
    this.closeEditor();
    this.loadSections();
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
    
    const sectionIds = data.map((section, index) => section.id);
    
    this.sectionService.reorderSections(sectionIds).subscribe({
      next: (sections) => {
        this.dataSource.data = sections;
        this.snackBar.open(this.translate.instant('SECTIONS_REORDERED'), this.translate.instant('CLOSE_BTN'), { duration: 3000 });
      },
      error: (error) => {
        this.snackBar.open(this.translate.instant('ERROR_REORDERING_SECTIONS'), this.translate.instant('CLOSE_BTN'), { duration: 3000 });
        
        this.loadSections();
      }
    });
  }

  setPreviewMode(mode: 'desktop' | 'tablet' | 'mobile'): void {
    this.previewMode = mode;
  }
}