
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { SectionService } from '../../../services/section.service';
import { Section, ReorderSectionsDto } from '../../../models/section.model';
import { SectionFormComponent } from '../section-form/section-form.component';

@Component({
  selector: 'app-section-list',
  templateUrl: './section-list.component.html',
  styleUrls: ['./section-list.component.scss']
})
export class SectionListComponent implements OnInit {
  sections: Section[] = [];
  loading = false;

  displayedColumns: string[] = ['order', 'title', 'type', 'isActive', 'createdAt', 'actions'];

  constructor(
    private sectionService: SectionService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadSections();
  }

  loadSections(): void {
    this.loading = true;
    this.sectionService.getSections().subscribe({
      next: (sections) => {
        this.sections = sections;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading sections:', error);
        this.snackBar.open('Error loading sections', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  addSection(): void {
    const dialogRef = this.dialog.open(SectionFormComponent, {
      width: '600px',
      data: { section: null }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadSections();
      }
    });
  }

  editSection(section: Section): void {
    const dialogRef = this.dialog.open(SectionFormComponent, {
      width: '600px',
      data: { section }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadSections();
      }
    });
  }

  toggleSection(section: Section): void {
    this.sectionService.toggleSection(section.id).subscribe({
      next: () => {
        this.snackBar.open(
          `Section ${section.isActive ? 'disabled' : 'enabled'}`, 
          'Close', 
          { duration: 3000 }
        );
        this.loadSections();
      },
      error: (error) => {
        console.error('Error toggling section:', error);
        this.snackBar.open('Error updating section', 'Close', { duration: 3000 });
      }
    });
  }

  deleteSection(section: Section): void {
    if (confirm('Are you sure you want to delete this section?')) {
      this.sectionService.deleteSection(section.id).subscribe({
        next: () => {
          this.snackBar.open('Section deleted', 'Close', { duration: 3000 });
          this.loadSections();
        },
        error: (error) => {
          console.error('Error deleting section:', error);
          this.snackBar.open('Error deleting section', 'Close', { duration: 3000 });
        }
      });
    }
  }

  drop(event: CdkDragDrop<Section[]>): void {
    moveItemInArray(this.sections, event.previousIndex, event.currentIndex);
    
    const reorderDto: ReorderSectionsDto = {
      sectionIds: this.sections.map(section => section.id)
    };

    this.sectionService.reorderSections(reorderDto).subscribe({
      next: (updatedSections) => {
        this.sections = updatedSections;
        this.snackBar.open('Sections reordered', 'Close', { duration: 3000 });
      },
      error: (error) => {
        console.error('Error reordering sections:', error);
        this.snackBar.open('Error reordering sections', 'Close', { duration: 3000 });
        this.loadSections(); // Reload to reset order
      }
    });
  }
}
