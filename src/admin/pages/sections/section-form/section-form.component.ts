
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
  uploadingImage = false;

  // 3D model
  model3dFile: File | null = null;
  model3dUrl: string | null = null;
  model3dFileName: string | null = null;
  uploading3d = false;


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
    
    if (this.isEditMode && this.data.section?.imageUrl) {
      this.imagePreview = this.data.section.imageUrl;
    } else if (this.sectionForm.value.imageUrl) {
      this.imagePreview = this.sectionForm.value.imageUrl;
    } else {
      this.imagePreview = null;
    }
    // 3D
    if (this.isEditMode && this.data.section?.model3dUrl) {
      this.model3dUrl = this.data.section.model3dUrl;
      this.model3dFileName = this.model3dUrl.split('/').pop() || null;
    }
  }

  private createForm(): FormGroup {
    const section = this.data?.section;

    return this.fb.group({
      type: [section?.type || 'hero', Validators.required],
      title: [section?.title || '', Validators.required],
      content: [section?.content || ''],
      imageUrl: [section?.imageUrl || ''],
      isActive: [section?.isActive ?? true],
      model3dUrl: [section?.model3dUrl || ''],
      show3d: [section?.show3d ?? false]
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.snackBar.open('Please select a valid image file', 'Close', { duration: 3000 });
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.snackBar.open('Image size must be less than 5MB', 'Close', { duration: 3000 });
        return;
      }

      this.imageFile = file;
      // Show preview (dataURL)
      const reader = new FileReader();
      reader.onload = e => this.imagePreview = reader.result;
      reader.readAsDataURL(this.imageFile);
      // Сбросить imageUrl в форме, чтобы не было конфликта
      this.sectionForm.patchValue({ imageUrl: '' });
    }
  }

  removeImage(): void {
    this.imageFile = null;
    this.imagePreview = null;
    this.sectionForm.patchValue({ imageUrl: '' });
  }

  private async uploadImageIfSelected(): Promise<string | null> {
    if (!this.imageFile) {
      // Если не выбран новый файл, используем url из формы
      return this.sectionForm.value.imageUrl || null;
    }

    this.uploadingImage = true;
    try {
      const response = await this.sectionService.uploadImage(this.imageFile).toPromise();
      this.uploadingImage = false;
      if (response?.url) {
        const baseUrl = 'https://angular-ecommerce-backend.onrender.com';
        const imageUrl = response.url.startsWith('http') ? response.url : baseUrl + response.url;
        this.sectionForm.patchValue({ imageUrl });
        this.imagePreview = imageUrl;
        return imageUrl;
      }
      return null;
    } catch (error) {
      this.uploadingImage = false;
      this.snackBar.open('Error uploading image', 'Close', { duration: 3000 });
      throw error;
    }
  }

  on3dFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (!file.name.endsWith('.glb')) {
        this.snackBar.open('Please select a .glb file', 'Close', { duration: 3000 });
        return;
      }
      this.model3dFile = file;
      this.model3dFileName = file.name;
      this.sectionForm.patchValue({ model3dUrl: '' });
    }
  }

  remove3dModel(): void {
    this.model3dFile = null;
    this.model3dUrl = null;
    this.model3dFileName = null;
    this.sectionForm.patchValue({ model3dUrl: '' });
  }

  async upload3dIfSelected(): Promise<string | null> {
    if (!this.model3dFile) {
      return this.sectionForm.value.model3dUrl || null;
    }
    this.uploading3d = true;
    try {
      const response = await this.sectionService.upload3dModel(this.model3dFile).toPromise();
      this.uploading3d = false;
      if (response?.url) {
        this.sectionForm.patchValue({ model3dUrl: response.url });
        this.model3dUrl = response.url;
        this.model3dFileName = response.url.split('/').pop() || null;
        return response.url;
      }
      return null;
    } catch (error) {
      this.uploading3d = false;
      this.snackBar.open('Error uploading 3D model', 'Close', { duration: 3000 });
      throw error;
    }
  }

  async onSubmit(): Promise<void> {
    if (this.sectionForm.valid) {
      this.loading = true;
      
      try {
        // Upload image first if selected
        const imageUrl = await this.uploadImageIfSelected();
        
        const formData = {
          ...this.sectionForm.value,
          imageUrl: imageUrl || this.sectionForm.value.imageUrl
        };

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
      } catch (error) {
        this.loading = false;
      }
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
