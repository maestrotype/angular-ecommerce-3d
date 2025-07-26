
import { Component, Inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { switchMap, catchError, finalize } from 'rxjs/operators';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SectionService } from '../../../services/section.service';
import { Section, CreateSectionDto, UpdateSectionDto, MenuItem } from '../../../models/section.model';

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

  logoFile: File | null = null;
  logoPreview: string | ArrayBuffer | null = null;
  uploadingLogo = false;

  model3dFile: File | null = null;
  model3dUrl: string | null = null;
  model3dFileName: string | null = null;
  uploading3d = false;

  sectionTypes = [
    { value: 'header', label: 'Header Section' },
    { value: 'hero', label: 'Hero Section' },
    { value: 'hero-glass', label: 'Hero Glass Section' },
    { value: 'best-sellers', label: 'Best Sellers Section' },
    { value: 'categories', label: 'Categories Section' },
    { value: 'special-offer', label: 'Special Offer Section' },
    { value: 'brands', label: 'Brands Section' },
    { value: 'contacts', label: 'Contacts Section' },
    { value: 'about', label: 'About Section' }
  ];

  menuAccessOptions = [
    { value: 'all', label: 'HEADER_MENU_ACCESS_ALL' },
    { value: 'admin', label: 'HEADER_MENU_ACCESS_ADMIN' },
    { value: 'closed', label: 'HEADER_MENU_ACCESS_CLOSED' }
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

    if (this.isEditMode && this.data.section?.settings?.logoUrl) {
      this.logoPreview = this.data.section.settings.logoUrl;
    }

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
      subtitle: [section?.subtitle || ''],
      content: [section?.content || ''],
      imageUrl: [section?.imageUrl || ''],
      isActive: [section?.isActive ?? true],
      model3dUrl: [section?.model3dUrl || ''],
      show3d: [section?.show3d ?? false],
      showImage: [section?.showImage ?? true],

      logoUrl: [section?.settings?.logoUrl || ''],
      showSearch: [section?.settings?.showSearch ?? true],
      showCart: [section?.settings?.showCart ?? true],
      showProfile: [section?.settings?.showProfile ?? true],
      menu: this.fb.array(
        (section?.settings?.menu || []).map((item: MenuItem) =>
          this.fb.group({
            title: [item.title, Validators.required],
            url: [item.url, Validators.required],
            access: [item.access || 'all', Validators.required],
            isActive: [item.isActive ?? true]
          })
        )
      )
    });
  }

  get menu(): FormArray {
    return this.sectionForm.get('menu') as FormArray;
  }

  addMenuItem() {
    this.menu.push(
      this.fb.group({
        title: ['', Validators.required],
        url: ['', Validators.required],
        access: ['all', Validators.required],
        isActive: [true]
      })
    );
  }

  removeMenuItem(index: number) {
    this.menu.removeAt(index);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      if (!file.type.startsWith('image/')) {
        this.snackBar.open('Please select a valid image file', 'Close', { duration: 3000 });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        this.snackBar.open('Image size must be less than 5MB', 'Close', { duration: 3000 });
        return;
      }

      this.imageFile = file;
      const reader = new FileReader();
      reader.onload = e => this.imagePreview = reader.result;
      reader.readAsDataURL(this.imageFile);
      this.sectionForm.patchValue({ imageUrl: '' });
    }
  }

  onLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      const validTypes = ['image/svg+xml', 'image/png', 'image/jpeg', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        this.snackBar.open('Please select a valid image file (SVG, PNG, JPG)', 'Close', { duration: 3000 });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        this.snackBar.open('Image size must be less than 5MB', 'Close', { duration: 3000 });
        return;
      }

      this.logoFile = file;
      const reader = new FileReader();
      reader.onload = e => this.logoPreview = reader.result;
      reader.readAsDataURL(this.logoFile);
      this.sectionForm.patchValue({ logoUrl: '' });
    }
  }

  removeImage(event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }
    this.imageFile = null;
    this.imagePreview = null;
    this.sectionForm.patchValue({ imageUrl: '' });
  }

  removeLogo(event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }
    this.logoFile = null;
    this.logoPreview = null;
    this.sectionForm.patchValue({ logoUrl: '' });
  }

  private async uploadImageIfSelected(): Promise<string | null> {
    if (!this.imageFile) {
      return this.sectionForm.value.imageUrl || null;
    }
    this.uploadingImage = true;
    try {
      const response = await this.sectionService.uploadImage(this.imageFile).toPromise();
      this.uploadingImage = false;
      if (response?.url) {
        const baseUrl = window.location.origin;
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

  private async uploadLogoIfSelected(): Promise<string | null> {
    if (!this.logoFile) {
      return this.sectionForm.value.logoUrl || null;
    }
    this.uploadingLogo = true;
    try {
      const response = await this.sectionService.uploadImage(this.logoFile).toPromise();
      this.uploadingLogo = false;
      if (response?.url) {
        const baseUrl = window.location.origin;
        const logoUrl = response.url.startsWith('http') ? response.url : baseUrl + response.url;
        this.sectionForm.patchValue({ logoUrl });
        this.logoPreview = logoUrl;
        return logoUrl;
      }
      return null;
    } catch (error) {
      this.uploadingLogo = false;
      this.snackBar.open('Error uploading logo', 'Close', { duration: 3000 });
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

  onSubmit(): void {
    if (this.sectionForm.invalid) return;

    this.loading = true;

    forkJoin({
      imageUrl: this.uploadImageIfSelected(),
      logoUrl: this.uploadLogoIfSelected(),
      model3dUrl: this.upload3dIfSelected()
    }).pipe(
      switchMap(({ imageUrl, logoUrl, model3dUrl }) => {
        const formValue = this.sectionForm.value;
        
        let formData: any;
        
        if (formValue.type === 'header') {
          formData = {
            type: formValue.type,
            title: formValue.title || 'Header',
            subtitle: formValue.subtitle || '',
            content: formValue.content || '',
            imageUrl: imageUrl || '',
            isActive: formValue.isActive,
            model3dUrl: model3dUrl || '',
            show3d: formValue.show3d || false,
            showImage: formValue.showImage || true,
            settings: {
              logoUrl: logoUrl || '',
              showSearch: formValue.showSearch ?? true,
              showCart: formValue.showCart ?? true,
              showProfile: formValue.showProfile ?? true,
              menu: formValue.menu || []
            }
          };
        } else {
          formData = {
            ...formValue,
            imageUrl: imageUrl || '',
            model3dUrl: model3dUrl || ''
          };
        }

        if (this.isEditMode && this.data.section?.id) {
          return this.sectionService.updateSection(this.data.section.id, formData);
        } else {
          return this.sectionService.createSection(formData);
        }
      }),
      finalize(() => this.loading = false),
      catchError(error => {
        this.snackBar.open('Error saving section', 'Close', { duration: 3000 });
        return of(null);
      })
    ).subscribe(result => {
      if (result) {
        this.snackBar.open(
          this.isEditMode ? 'Section updated successfully' : 'Section created successfully',
          'Close',
          { duration: 3000 }
        );
        this.dialogRef.close(result);
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
