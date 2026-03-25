
import { Component, Inject, ViewChildren, QueryList, AfterViewInit, Input, Output, EventEmitter, Optional, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin, of, Observable, throwError } from 'rxjs';
import { switchMap, catchError, finalize, map } from 'rxjs/operators';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SectionService } from '../../../services/section.service';
import { Section, CreateSectionDto, UpdateSectionDto, MenuItem } from '../../../models/section.model';
import { LocalizedString } from '../../../../shared/models/localized-string.model';
import { getLocalizedString } from '../../../../shared/utils/localization.util';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ImageUploadComponent } from '../../../components/ui/image-upload/image-upload.component';

@Component({
  selector: 'app-section-form',
  templateUrl: './section-form.component.html',
  styleUrls: ['./section-form.component.scss']
})
export class SectionFormComponent implements AfterViewInit, OnInit {
  @Input() data: { section: Section | null } = { section: null };
  @Input() isDrawerMode = false;

  @Output() formChanged = new EventEmitter<any>();
  @Output() saved = new EventEmitter<any>();
  @Output() cancelled = new EventEmitter<void>();
  @ViewChildren(ImageUploadComponent) imageUploadComponents!: QueryList<ImageUploadComponent>;

  sectionForm: FormGroup;
  isEditMode: boolean;
  loading = false;
  uploadingImage = false;
  uploadingLogo = false;
  uploadingCategoryIcon = false;
  uploadingBrandLogo = false;
  private _activeMenuLang = localStorage.getItem('admin_menu_lang') || 'en';
  get activeMenuLang() { return this._activeMenuLang; }
  set activeMenuLang(val: string) {
    if (this._activeMenuLang !== val) {
      console.log(`[SectionFormComponent] Language changing from ${this._activeMenuLang} to ${val}`);
      this._activeMenuLang = val;
      localStorage.setItem('admin_menu_lang', val);
    }
  }

  onLangChange(lang: string) {
    this.activeMenuLang = lang;
  }

  trackByFn(index: number) {
    return index;
  }

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
    @Optional() public dialogRef: MatDialogRef<SectionFormComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public dialogData: { section: Section | null }
  ) {
    this.sectionForm = this.fb.group({}); // Temp init
    this.isEditMode = false;
  }

  ngOnInit(): void {
    const dataSource = this.isDrawerMode ? this.data : this.dialogData;
    this.isEditMode = !!dataSource?.section;
    this.sectionForm = this.createForm(dataSource?.section);

    if (this.isEditMode && dataSource?.section?.model3dUrl) {
      this.model3dUrl = dataSource.section.model3dUrl;
      this.model3dFileName = dataSource.section.model3dUrl.split('/').pop() || null;
    }

    this.loadAvailableSections();

    // Live Sync for Preview
    this.sectionForm.valueChanges.subscribe(val => {
      const packed = this.packLocalizedFields(val);
      // Ensure other fields from val are preserved
      const previewData = { ...val, ...packed };
      this.formChanged.emit(previewData);
    });
  }

  ngAfterViewInit(): void {
    // Subscribe to changes in the imageUploadComponents QueryList
    this.imageUploadComponents.changes.subscribe(() => {
      // This will be called whenever the QueryList changes,
      // allowing you to access the newly added ImageUploadComponent instances.
      // For example, if you need to re-initialize them or update their state.
      // This is a placeholder; you might need to implement specific logic here
      // if you have specific initialization needs for the image upload components.
    });
  }

  private loadAvailableSections(): void {
    this.sectionService.getSections().subscribe(sections => {
      this.availableSections = sections.filter(s => s.type !== 'header');
    });
  }

  private createForm(section?: Section | null): FormGroup {

    // Map database type to display type
    let displayType = section?.type || 'hero';
    if (section?.type === 'categories') {
      displayType = 'categories'; // Use the value from sectionTypes
    }

    return this.fb.group({
      type: [displayType, Validators.required],
      title_en: [this.getLocalizedValue(section?.title, 'en') || '', (displayType === 'header' || displayType === 'brands' || displayType === 'categories') ? [] : [Validators.required]],
      title_ru: [this.getLocalizedValue(section?.title, 'ru') || ''],
      title_ua: [this.getLocalizedValue(section?.title, 'ua') || ''],
      subtitle_en: [this.getLocalizedValue(section?.subtitle, 'en') || ''],
      subtitle_ru: [this.getLocalizedValue(section?.subtitle, 'ru') || ''],
      subtitle_ua: [this.getLocalizedValue(section?.subtitle, 'ua') || ''],
      content_en: [this.getLocalizedValue(section?.content, 'en') || ''],
      content_ru: [this.getLocalizedValue(section?.content, 'ru') || ''],
      content_ua: [this.getLocalizedValue(section?.content, 'ua') || ''],
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
        (section?.settings?.menu || []).map((item: MenuItem) => {
          let titleObj: LocalizedString;
          if (typeof item.title === 'string') {
            titleObj = { en: item.title, ru: item.title, ua: item.title };
          } else {
            titleObj = {
              en: item.title?.en || '',
              ru: item.title?.ru || '',
              ua: item.title?.ua || ''
            };
          }
          return this.fb.group({
            title: this.fb.group({
              en: [titleObj.en],
              ru: [titleObj.ru],
              ua: [titleObj.ua]
            }),
            url: [item.url, Validators.required],
            access: [item.access || 'all', Validators.required],
            isActive: [item.isActive ?? true],
            sectionId: [item['sectionId'] || null]
          });
        })
      ),
      categories: this.fb.array(
        (section?.settings?.categories || []).map((category: any) =>
          this.fb.group({
            name: [category.name, Validators.required],
            slug: [category.slug || '', Validators.required],
            icon: [category.icon],
            isActive: [category.isActive ?? true]
          })
        )
      ),
      brands: this.fb.array(
        (section?.settings?.brands || []).map((brand: any) =>
          this.fb.group({
            name: [brand.name, Validators.required],
            logo: [brand.logo || ''],
            isActive: [brand.isActive ?? true]
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

  get brands(): FormArray {
    return this.sectionForm.get('brands') as FormArray;
  }

  addMenuItem() {
    this.menu.push(this.fb.group({
      title: this.fb.group({
        en: ['', Validators.required],
        ru: [''],
        ua: ['']
      }),
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

  addBrand() {
    this.brands.push(this.fb.group({
      name: ['', Validators.required],
      logo: [''],
      isActive: [true]
    }));
  }

  removeMenuItem(index: number) {
    this.menu.removeAt(index);
  }

  removeCategory(index: number) {
    this.categories.removeAt(index);
  }

  removeBrand(index: number) {
    this.brands.removeAt(index);
  }

  dropMenuItem(event: CdkDragDrop<FormArray>) {
    const dir = event.previousIndex > event.currentIndex ? -1 : 1;
    const from = event.previousIndex;
    const to = event.currentIndex;

    if (from === to) return;

    const control = this.menu.at(from);
    this.menu.removeAt(from);
    this.menu.insert(to, control);
  }

  dropCategory(event: CdkDragDrop<FormArray>) {
    const from = event.previousIndex;
    const to = event.currentIndex;

    if (from === to) return;

    const control = this.categories.at(from);
    this.categories.removeAt(from);
    this.categories.insert(to, control);
  }

  dropBrand(event: CdkDragDrop<FormArray>) {
    const from = event.previousIndex;
    const to = event.currentIndex;

    if (from === to) return;

    const control = this.brands.at(from);
    this.brands.removeAt(from);
    this.brands.insert(to, control);
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

  onCategoryIconSelected(file: File, index: number): void {
    this.uploadingCategoryIcon = true;
    this.sectionService.uploadImage(file).subscribe({
      next: (response) => {
        if (response?.url) {
          const iconUrl = response.url;
          this.categories.at(index).patchValue({ icon: iconUrl });

          // Find the corresponding image upload component and notify it
          const imageUploadComponents = this.imageUploadComponents.toArray();
          if (imageUploadComponents[index + 1]) { // +1 because first component is for logo
            imageUploadComponents[index + 1].onUploadSuccess(iconUrl);
          }
        }
        this.uploadingCategoryIcon = false;
      },
      error: (error) => {

        this.snackBar.open('Error uploading category icon', 'Close', { duration: 3000 });
        this.uploadingCategoryIcon = false;
      }
    });
  }

  onCategoryIconUploaded(url: string, index: number): void {
    this.categories.at(index).patchValue({ icon: url });
  }

  removeCategoryIcon(index: number): void {
    this.categories.at(index).patchValue({ icon: '' });
  }

  onBrandLogoSelected(file: File, index: number): void {
    this.uploadingBrandLogo = true;
    this.sectionService.uploadImage(file).subscribe({
      next: (response) => {
        if (response?.url) {
          const logoUrl = response.url;
          this.brands.at(index).patchValue({ logo: logoUrl });

          // Notify the image upload component
          const imageUploadComponents = this.imageUploadComponents.toArray();
          // Offset logic: Find by index among specific components if needed, or rely on index
          // This logic depends on the HTML structure. First is logo, then categories, then brands.
        }
        this.uploadingBrandLogo = false;
      },
      error: (error) => {
        this.snackBar.open('Error uploading brand logo', 'Close', { duration: 3000 });
        this.uploadingBrandLogo = false;
      }
    });
  }

  onBrandLogoUploaded(url: string, index: number): void {
    this.brands.at(index).patchValue({ logo: url });
  }

  removeBrandLogo(index: number): void {
    this.brands.at(index).patchValue({ logo: '' });
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

  private upload3dIfSelected(): Observable<string | null> {
    if (!this.model3dFile) {
      return of(this.sectionForm.value.model3dUrl || null);
    }

    this.uploading3d = true;
    return this.sectionService.upload3dModel(this.model3dFile).pipe(
      map(response => {
        this.uploading3d = false;
        if (response?.url) {
          const baseUrl = window.location.origin;
          const model3dUrl = response.url.startsWith('http') ? response.url : baseUrl + response.url;
          this.sectionForm.patchValue({ model3dUrl });
          return model3dUrl;
        }
        return null;
      }),
      catchError(error => {
        this.uploading3d = false;
        this.snackBar.open('Error uploading 3D model', 'Close', { duration: 3000 });
        return throwError(() => error);
      })
    );
  }

  onSubmit(): void {
    if (this.sectionForm.invalid) {
      this.sectionForm.markAllAsTouched();
      this.snackBar.open('Please fill in all required fields correctly', 'Close', { duration: 3000 });
      return;
    }

    this.loading = true;

    this.upload3dIfSelected().subscribe({
      next: (model3dUrl) => {
        const rawFormValue = this.sectionForm.value;
        const formValue = this.packLocalizedFields(rawFormValue);
        console.log('[SectionFormComponent] Submitting form data:', formValue);

        let formData: any;

        if (formValue.type === 'header') {
          formData = {
            type: formValue.type,
            title: formValue.title,
            subtitle: formValue.subtitle,
            content: formValue.content,
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
              menu: (formValue.menu || []).map((item: any) => ({
                ...item,
                title: {
                  en: item.title?.en || '',
                  ru: item.title?.ru || '',
                  ua: item.title?.ua || ''
                }
              })),
              categories: (formValue.categories || []).map((cat: any) => ({
                ...cat,
                slug: cat.slug || getLocalizedString(cat.name).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
              }))
            }
          };
        } else if (formValue.type === 'categories') {
          formData = {
            type: 'categories',
            title: formValue.title,
            subtitle: formValue.subtitle,
            content: formValue.content,
            imageUrl: formValue.imageUrl || '',
            isActive: formValue.isActive,
            model3dUrl: model3dUrl || '',
            show3d: formValue.show3d || false,
            showImage: formValue.showImage || true,
            settings: {
              categories: (formValue.categories || []).map((cat: any) => ({
                ...cat,
                slug: cat.slug || getLocalizedString(cat.name).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
              }))
            }
          };
        } else if (formValue.type === 'brands') {
          formData = {
            type: 'brands',
            title: formValue.title,
            subtitle: formValue.subtitle,
            content: formValue.content,
            imageUrl: '',
            isActive: formValue.isActive,
            model3dUrl: '',
            show3d: false,
            showImage: false,
            settings: {
              brands: (formValue.brands || []).map((brand: any) => ({
                ...brand
              }))
            }
          };
        } else {
          formData = {
            ...formValue,
            model3dUrl: model3dUrl || ''
          };
        }

        const dataSource = this.isDrawerMode ? this.data : this.dialogData;
        if (this.isEditMode && dataSource?.section?.id) {
          this.sectionService.updateSection(dataSource.section.id, formData).subscribe({
            next: (result) => {
              this.loading = false;
              this.snackBar.open('Section updated successfully', 'Close', { duration: 3000 });
              if (this.isDrawerMode) {
                this.saved.emit(result);
              } else {
                this.dialogRef.close(result);
              }
            },
            error: (error) => {
              this.loading = false;
              this.snackBar.open('Error updating section', 'Close', { duration: 3000 });
            }
          });
        } else {
          this.sectionService.createSection(formData).subscribe({
            next: (result) => {
              this.loading = false;
              this.snackBar.open('Section created successfully', 'Close', { duration: 3000 });
              if (this.isDrawerMode) {
                this.saved.emit(result);
              } else {
                this.dialogRef.close(result);
              }
            },
            error: (error) => {
              this.loading = false;
              this.snackBar.open('Error creating section', 'Close', { duration: 3000 });
            }
          });
        }
      },
      error: (error) => {
        this.loading = false;
        this.snackBar.open('Error processing section', 'Close', { duration: 3000 });
      }
    });
  }

  onCancel(): void {
    if (this.isDrawerMode) {
      this.cancelled.emit();
    } else {
      this.dialogRef.close();
    }
  }

  getLocalizedValue(value: any, lang: string): string {
    if (!value) return '';
    if (typeof value === 'string') return lang === 'en' ? value : '';
    return value[lang] || '';
  }

  private packLocalizedFields(formValue: any): any {
    const data = { ...formValue };

    data.title = {
      en: formValue.title_en,
      ru: formValue.title_ru,
      ua: formValue.title_ua
    };

    data.subtitle = {
      en: formValue.subtitle_en,
      ru: formValue.subtitle_ru,
      ua: formValue.subtitle_ua
    };

    data.content = {
      en: formValue.content_en,
      ru: formValue.content_ru,
      ua: formValue.content_ua
    };

    // Cleanup temporary fields
    delete data.title_en; delete data.title_ru; delete data.title_ua;
    delete data.subtitle_en; delete data.subtitle_ru; delete data.subtitle_ua;
    delete data.content_en; delete data.content_ru; delete data.content_ua;

    return data;
  }
}
