
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { SectionService } from '../../../services/section.service';
import { SectionFormComponent } from '../section-form/section-form.component';
import { Section } from '../../../models/section.model';

@Component({
  selector: 'app-section-list',
  templateUrl: './section-list.component.html',
  styleUrls: ['./section-list.component.scss']
})
export class SectionListComponent implements OnInit {
  displayedColumns: string[] = ['order', 'type', 'title', 'isActive', 'createdAt', 'actions'];
  dataSource = new MatTableDataSource<Section>();
  loading = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private sectionService: SectionService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadSections();
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
        this.snackBar.open(
          error?.status === 500
            ? 'Server error: please check backend logs or try again later.'
            : 'Error loading sections',
          'Close',
          { duration: 5000 }
        );
        console.error('Error loading sections:', error);
      }
    });
  }

  addSection(): void {
    const dialogRef = this.dialog.open(SectionFormComponent, {
      width: '600px',
      data: {}
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
        this.snackBar.open(`Section ${section.isActive ? 'deactivated' : 'activated'}`, 'Close', { duration: 3000 });
        this.loadSections();
      },
      error: (error) => {
        this.snackBar.open('Error updating section', 'Close', { duration: 3000 });
        console.error('Error toggling section:', error);
      }
    });
  }

  deleteSection(section: Section): void {
    if (confirm('Are you sure you want to delete this section?')) {
      this.sectionService.deleteSection(section.id).subscribe({
        next: () => {
          this.snackBar.open('Section deleted successfully', 'Close', { duration: 3000 });
          this.loadSections();
        },
        error: (error) => {
          this.snackBar.open('Error deleting section', 'Close', { duration: 3000 });
          console.error('Error deleting section:', error);
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
        this.snackBar.open('Sections reordered successfully', 'Close', { duration: 3000 });
      },
      error: (error) => {
        this.snackBar.open('Error reordering sections', 'Close', { duration: 3000 });
        console.error('Error reordering sections:', error);
        this.loadSections();
      }
    });
  }
}