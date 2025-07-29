
import { Component, Inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { switchMap, catchError, finalize } from 'rxjs/operators';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SectionService } from '../../../services/section.service';
import { Section, CreateSectionDto, UpdateSectionDto, MenuItem } from '../../../models/section.model';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-section-form',
  templateUrl: './section-form.component.html',
  styleUrls: ['./section-form.component.scss']
})
export class SectionFormComponent {
  sectionForm: FormGroup;
  isEditMode: boolean;
  loading = false;
  uploadingImage = false;
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

  availableSections: Section[] = [];

  constructor(
    private fb: FormBuilder,
    private sectionService: SectionService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<SectionFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { section: Section | null }
  ) {
    this.isEditMode = !!data.section;
    this.sectionForm = this.createForm();

    if (this.isEditMode && this.data.section?.model3dUrl) {
      this.model3dUrl = this.data.section.model3dUrl;
      this.model3dFileName = this.data.section.model3dUrl.split('/').pop() || null;
    }

    this.loadAvailableSections();
  }

  private loadAvailableSections(): void {
    this.sectionService.getSections().subscribe(sections => {
      this.availableSections = sections.filter(s => s.type !== 'header');
    });
  }

  private createForm(): FormGroup {
    const section = this.data?.section;
    
    // Map database type to display type
    let displayType = section?.type || 'hero';
    if (section?.type === 'categories') {
      displayType = 'categories'; // Use the value from sectionTypes
    }

    return this.fb.group({
      type: [displayType, Validators.required],
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
            isActive: [item.isActive ?? true],
            sectionId: [item['sectionId'] || null]
          })
        )
      ),
      categories: this.fb.array(
        (section?.settings?.categories || []).map((category: any) =>
          this.fb.group({
            name: [category.name, Validators.required],
            slug: [category.slug, Validators.required],
            icon: [category.icon],
            isActive: [category.isActive ?? true]
          })
        )
      )
    });
  }

  get menu(): FormArray {
    return this.sectionForm.get('menu') as FormArray;
  }

  get categories(): FormArray {
    return this.sectionForm.get('categories') as FormArray;
  }

  addMenuItem() {
    this.menu.push(this.fb.group({
      title: ['', Validators.required],
      url: ['', Validators.required],
      access: ['all', Validators.required],
      isActive: [true],
      sectionId: [null]
    }));
  }

  addCategory() {
    this.categories.push(this.fb.group({
      name: ['', Validators.required],
      slug: ['', Validators.required],
      icon: [''],
      isActive: [true]
    }));
  }

  removeMenuItem(index: number) {
    this.menu.removeAt(index);
  }

  removeCategory(index: number) {
    this.categories.removeAt(index);
  }

  dropMenuItem(event: CdkDragDrop<FormArray>) {
    moveItemInArray(this.menu.controls, event.previousIndex, event.currentIndex);
  }

  dropCategory(event: CdkDragDrop<FormArray>) {
    moveItemInArray(this.categories.controls, event.previousIndex, event.currentIndex);
  }

  onSectionSelect(index: number, sectionId: number | null) {
    const menuItem = this.menu.at(index);
    if (sectionId) {
      const section = this.availableSections.find(s => s.id === sectionId);
      if (section) {
        menuItem.patchValue({ url: `#${section.type}`, sectionId });
      }
    } else {
      menuItem.patchValue({ sectionId: null });
    }
  }

  onImageFileSelected(file: File): void {
    this.uploadingImage = true;
    this.sectionService.uploadImage(file).subscribe({
      next: (response) => {
        if (response?.url) {
          const baseUrl = window.location.origin;
          const imageUrl = response.url.startsWith('http') ? response.url : baseUrl + response.url;
          this.sectionForm.patchValue({ imageUrl });
        }
        this.uploadingImage = false;
      },
      error: (error) => {
        this.uploadingImage = false;
        this.snackBar.open('Error uploading image', 'Close', { duration: 3000 });
      }
    });
  }

  onImageUploaded(url: string): void {
    this.sectionForm.patchValue({ imageUrl: url });
  }

  onLogoFileSelected(file: File): void {
    this.uploadingLogo = true;
    this.sectionService.uploadImage(file).subscribe({
      next: (response) => {
        if (response?.url) {
          const baseUrl = window.location.origin;
          const logoUrl = response.url.startsWith('http') ? response.url : baseUrl + response.url;
          this.sectionForm.patchValue({ logoUrl });
        }
        this.uploadingLogo = false;
      },
      error: (error) => {
        this.uploadingLogo = false;
        this.snackBar.open('Error uploading logo', 'Close', { duration: 3000 });
      }
    });
  }

  onLogoUploaded(url: string): void {
    this.sectionForm.patchValue({ logoUrl: url });
    this.uploadingLogo = false;
  }

  onCategoryIconSelected(event: Event, index: number): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.uploadCategoryIcon(file, index);
    }
  }

  removeCategoryIcon(index: number): void {
    this.categories.at(index).patchValue({ icon: '' });
  }

  selectCategoryIcon(index: number): void {
    // Создаем временный input элемент для выбора файла
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (event: Event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        this.uploadCategoryIcon(file, index);
      }
    };
    input.click();
  }

  private async uploadCategoryIcon(file: File, index: number): Promise<void> {
    // Здесь должна быть логика загрузки иконки
    // Пока что просто создаем URL для демонстрации
    const url = URL.createObjectURL(file);
    this.categories.at(index).patchValue({ icon: url });
  }

  on3dFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      if (!file.name.toLowerCase().endsWith('.glb')) {
        this.snackBar.open('Please select a valid .glb 3D model file', 'Close', { duration: 3000 });
        return;
      }

      if (file.size > 50 * 1024 * 1024) {
        this.snackBar.open('3D model size must be less than 50MB', 'Close', { duration: 3000 });
        return;
      }

      this.model3dFile = file;
      this.model3dFileName = file.name;
      this.sectionForm.patchValue({ model3dUrl: '' });
    }
  }

  remove3dModel(event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }
    this.model3dFile = null;
    this.model3dUrl = null;
    this.model3dFileName = null;
    this.sectionForm.patchValue({ model3dUrl: '' });
  }

  private async upload3dIfSelected(): Promise<string | null> {
    if (!this.model3dFile) {
      return this.sectionForm.value.model3dUrl || null;
    }
    this.uploading3d = true;
    try {
      const response = await this.sectionService.upload3dModel(this.model3dFile).toPromise();
      this.uploading3d = false;
      if (response?.url) {
        const baseUrl = window.location.origin;
        const model3dUrl = response.url.startsWith('http') ? response.url : baseUrl + response.url;
        this.sectionForm.patchValue({ model3dUrl });
        return model3dUrl;
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

    this.upload3dIfSelected().then(model3dUrl => {
      const formValue = this.sectionForm.value;

      let formData: any;

      if (formValue.type === 'header') {
        formData = {
          type: formValue.type,
          title: formValue.title || 'Header',
          subtitle: formValue.subtitle || '',
          content: formValue.content || '',
          imageUrl: formValue.imageUrl || '',
          isActive: formValue.isActive,
          model3dUrl: model3dUrl || '',
          show3d: formValue.show3d || false,
          showImage: formValue.showImage || true,
          settings: {
            logoUrl: formValue.logoUrl || '',
            showSearch: formValue.showSearch ?? true,
            showCart: formValue.showCart ?? true,
            showProfile: formValue.showProfile ?? true,
            menu: formValue.menu || [],
            categories: formValue.categories || []
          }
        };
      } else if (formValue.type === 'categories') {
        // Special handling for categories section
        formData = {
          type: 'categories', // Always use 'categories' for database
          title: formValue.title || 'Categories',
          subtitle: formValue.subtitle || '',
          content: formValue.content || '',
          imageUrl: formValue.imageUrl || '',
          isActive: formValue.isActive,
          model3dUrl: model3dUrl || '',
          show3d: formValue.show3d || false,
          showImage: formValue.showImage || true,
          settings: {
            categories: formValue.categories || []
          }
        };
      } else {
        const { logoUrl, showSearch, showCart, showProfile, menu, categories, ...sectionData } = formValue;
        formData = {
          ...sectionData,
          model3dUrl: model3dUrl || ''
        };
      }

      if (this.isEditMode && this.data.section?.id) {
        this.sectionService.updateSection(this.data.section.id, formData).subscribe({
          next: (result) => {
            this.loading = false;
            this.snackBar.open('Section updated successfully', 'Close', { duration: 3000 });
            this.dialogRef.close(result);
          },
          error: (error) => {
            this.loading = false;
            console.error('Error updating section:', error);
            this.snackBar.open('Error updating section', 'Close', { duration: 3000 });
          }
        });
      } else {
        this.sectionService.createSection(formData).subscribe({
          next: (result) => {
            this.loading = false;
            this.snackBar.open('Section created successfully', 'Close', { duration: 3000 });
            this.dialogRef.close(result);
          },
          error: (error) => {
            this.loading = false;
            console.error('Error creating section:', error);
            this.snackBar.open('Error creating section', 'Close', { duration: 3000 });
          }
        });
      }
    }).catch(error => {
      this.loading = false;
      console.error('Error in upload process:', error);
      this.snackBar.open('Error processing section', 'Close', { duration: 3000 });
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
