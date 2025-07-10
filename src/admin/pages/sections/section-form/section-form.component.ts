
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SectionService } from '../../../services/section.service';
import { Section, CreateSectionDto, UpdateSectionDto } from '../../../models/section.model';

@Component({
  selector: 'app-section-form',
  templateUrl: './section-form.component.html',
  styleUrls: ['./section-form.component.scss']
})
export class SectionFormComponent {
  sectionForm: FormGroup;
  isEditMode: boolean;
  loading = false;
  imageFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;

  sectionTypes = [
    { value: 'hero', label: 'Hero Section' },
    { value: 'about', label: 'About Section' },
    { value: 'contact', label: 'Contact Section' },
    { value: 'promo', label: 'Promo Section' },
    { value: 'features', label: 'Features Section' },
    { value: 'testimonials', label: 'Testimonials Section' }
  ];

  constructor(
    private fb: FormBuilder,
    private sectionService: SectionService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<SectionFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { section?: Section }
  ) {
    this.isEditMode = !!data?.section;
    this.sectionForm = this.createForm();
  }

  private createForm(): FormGroup {
    const section = this.data?.section;

    return this.fb.group({
      type: [section?.type || 'hero', Validators.required],
      title: [section?.title || '', Validators.required],
      content: [section?.content || ''],
      imageUrl: [section?.imageUrl || ''],
      isActive: [section?.isActive ?? true]
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.imageFile = input.files[0];
  
      // For preview
      const reader = new FileReader();
      reader.onload = e => this.imagePreview = reader.result;
      reader.readAsDataURL(this.imageFile);
    }
  }

  onSubmit(): void {
    if (this.sectionForm.valid) {
      this.loading = true;
      const formData = this.sectionForm.value;

      if (this.isEditMode && this.data.section?.id) {
        const updateData: UpdateSectionDto = formData;
        this.sectionService.updateSection(this.data.section.id, updateData).subscribe({
          next: (updatedSection) => {
            this.snackBar.open('Section updated successfully', 'Close', { duration: 3000 });
            this.dialogRef.close(updatedSection);
          },
          error: (error) => {
            this.snackBar.open('Error updating section', 'Close', { duration: 3000 });
            console.error('Error updating section:', error);
            this.loading = false;
          }
        });
      } else {
        const createData: CreateSectionDto = formData;
        this.sectionService.createSection(createData).subscribe({
          next: (newSection) => {
            this.snackBar.open('Section created successfully', 'Close', { duration: 3000 });
            this.dialogRef.close(newSection);
          },
          error: (error) => {
            this.snackBar.open('Error creating section', 'Close', { duration: 3000 });
            console.error('Error creating section:', error);
            this.loading = false;
          }
        });
      }
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
