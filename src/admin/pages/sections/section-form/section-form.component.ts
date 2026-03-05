
import { Component, Inject, ViewChildren, QueryList, AfterViewInit } from '@angular/core';
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
export class SectionFormComponent implements AfterViewInit {
  @ViewChildren(ImageUploadComponent) imageUploadComponents!: QueryList<ImageUploadComponent>;

  sectionForm: FormGroup;
  isEditMode: boolean;
  loading = false;
  uploadingImage = false;
  uploadingLogo = false;
  uploadingCategoryIcon = false;

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

  // Material icons available for features
  availableIcons = [
    'verified', 'local_shipping', 'support_agent', 'star', 'favorite',
    'workspace_premium', 'thumb_up', 'security', 'eco', 'bolt',
    'handshake', 'diamond', 'rocket_launch', 'public', 'spa'
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

  ngAfterViewInit(): void {
    this.imageUploadComponents.changes.subscribe(() => { });
  }

  private loadAvailableSections(): void {
    this.sectionService.getSections().subscribe(sections => {
      this.availableSections = sections.filter(s => s.type !== 'header');
    });
  }

  private createForm(): FormGroup {
    const section = this.data?.section;

    let displayType = section?.type || 'hero';
    if (section?.type === 'categories') {
      displayType = 'categories';
    }

    const settings = section?.settings || {};

    return this.fb.group({
      type: [displayType, Validators.required],
      title_en: [this.getLocalizedValue(section?.title, 'en') || '', Validators.required],
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

      // Header-specific fields
      logoUrl: [settings?.logoUrl || ''],
      showSearch: [settings?.showSearch ?? true],
      showCart: [settings?.showCart ?? true],
      showProfile: [settings?.showProfile ?? true],
      menu: this.fb.array(
        (settings?.menu || []).map((item: MenuItem) =>
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
        (settings?.categories || []).map((category: any) =>
          this.fb.group({
            name: [category.name, Validators.required],
            slug: [category.slug || '', Validators.required],
            icon: [category.icon],
            isActive: [category.isActive ?? true]
          })
        )
      ),

      // About-specific fields
      cta_label_en: [this.getLocalizedValue((settings as any)?.ctaLabel, 'en') || ''],
      cta_label_ru: [this.getLocalizedValue((settings as any)?.ctaLabel, 'ru') || ''],
      cta_label_ua: [this.getLocalizedValue((settings as any)?.ctaLabel, 'ua') || ''],
      cta_url: [(settings as any)?.ctaUrl || '/shop'],
      stats: this.fb.array(
        ((settings as any)?.stats || []).map((stat: any) =>
          this.fb.group({
            value: [stat.value || '', Validators.required],
            label_en: [stat.label_en || '', Validators.required],
            label_ru: [stat.label_ru || ''],
            label_ua: [stat.label_ua || '']
          })
        )
      ),
      features: this.fb.array(
        ((settings as any)?.features || []).map((feature: any) =>
          this.fb.group({
            icon: [feature.icon || 'verified'],
            iconUrl: [feature.iconUrl || ''],
            text_en: [feature.text_en || '', Validators.required],
            text_ru: [feature.text_ru || ''],
            text_ua: [feature.text_ua || '']
          })
        )
      )
    });
  }

  // ─── FormArray Getters ────────────────────────────────────────────────

  get menu(): FormArray {
    return this.sectionForm.get('menu') as FormArray;
  }

  get categories(): FormArray {
    return this.sectionForm.get('categories') as FormArray;
  }

  get stats(): FormArray {
    return this.sectionForm.get('stats') as FormArray;
  }

  get features(): FormArray {
    return this.sectionForm.get('features') as FormArray;
  }

  // ─── Header menu ─────────────────────────────────────────────────────

  addMenuItem() {
    this.menu.push(this.fb.group({
      title: ['', Validators.required],
      url: ['', Validators.required],
      access: ['all', Validators.required],
      isActive: [true],
      sectionId: [null]
    }));
  }

  removeMenuItem(index: number) {
    this.menu.removeAt(index);
  }

  dropMenuItem(event: CdkDragDrop<FormArray>) {
    moveItemInArray(this.menu.controls, event.previousIndex, event.currentIndex);
  }

  // ─── Categories ───────────────────────────────────────────────────────

  addCategory() {
    this.categories.push(this.fb.group({
      name: ['', Validators.required],
      slug: ['', Validators.required],
      icon: [''],
      isActive: [true]
    }));
  }

  removeCategory(index: number) {
    this.categories.removeAt(index);
  }

  dropCategory(event: CdkDragDrop<FormArray>) {
    moveItemInArray(this.categories.controls, event.previousIndex, event.currentIndex);
  }

  // ─── About Stats ──────────────────────────────────────────────────────

  addStat() {
    this.stats.push(this.fb.group({
      value: ['', Validators.required],
      label_en: ['', Validators.required],
      label_ru: [''],
      label_ua: ['']
    }));
  }

  removeStat(index: number) {
    this.stats.removeAt(index);
  }

  dropStat(event: CdkDragDrop<FormArray>) {
    moveItemInArray(this.stats.controls, event.previousIndex, event.currentIndex);
  }

  // ─── About Features ───────────────────────────────────────────────────

  addFeature() {
    this.features.push(this.fb.group({
      icon: ['verified'],
      iconUrl: [''],
      text_en: ['', Validators.required],
      text_ru: [''],
      text_ua: ['']
    }));
  }

  removeFeature(index: number) {
    this.features.removeAt(index);
  }

  dropFeature(event: CdkDragDrop<FormArray>) {
    moveItemInArray(this.features.controls, event.previousIndex, event.currentIndex);
  }

  // ─── Section select helper ────────────────────────────────────────────

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

  // ─── Image uploads ───────────────────────────────────────────────────

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
      error: () => {
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
      error: () => {
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

          const imageUploadComponents = this.imageUploadComponents.toArray();
          if (imageUploadComponents[index + 1]) {
            imageUploadComponents[index + 1].onUploadSuccess(iconUrl);
          }
        }
        this.uploadingCategoryIcon = false;
      },
      error: () => {
        this.snackBar.open('Error uploading category icon', 'Close', { duration: 3000 });
        this.uploadingCategoryIcon = false;
      }
    });
  }

  onCategoryIconUploaded(url: string, index: number): void {
    this.categories.at(index).patchValue({ icon: url });
  }

  onFeatureIconSelected(file: File, index: number): void {
    this.uploadingCategoryIcon = true; // Reusing flag for simplicity or add specific
    this.sectionService.uploadImage(file).subscribe({
      next: (response) => {
        if (response?.url) {
          this.features.at(index).patchValue({ iconUrl: response.url });
        }
        this.uploadingCategoryIcon = false;
      },
      error: () => {
        this.snackBar.open('Error uploading feature icon', 'Close', { duration: 3000 });
        this.uploadingCategoryIcon = false;
      }
    });
  }

  onFeatureIconUploaded(url: string, index: number): void {
    this.features.at(index).patchValue({ iconUrl: url });
  }

  removeFeatureIcon(index: number): void {
    this.features.at(index).patchValue({ iconUrl: '' });
  }

  removeCategoryIcon(index: number): void {
    this.categories.at(index).patchValue({ icon: '' });
  }

  // ─── 3D Model ─────────────────────────────────────────────────────────

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

  // ─── Submit ───────────────────────────────────────────────────────────

  onSubmit(): void {
    if (this.sectionForm.invalid) return;

    this.loading = true;

    this.upload3dIfSelected().subscribe({
      next: (model3dUrl) => {
        const rawFormValue = this.sectionForm.value;
        const formValue = this.packLocalizedFields(rawFormValue);

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
              menu: formValue.menu || [],
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
        } else if (formValue.type === 'about') {
          formData = {
            type: 'about',
            title: formValue.title,
            subtitle: formValue.subtitle,
            content: formValue.content,
            imageUrl: formValue.imageUrl || '',
            isActive: formValue.isActive,
            model3dUrl: model3dUrl || '',
            show3d: formValue.show3d || false,
            showImage: formValue.showImage || true,
            settings: {
              ctaLabel: {
                en: rawFormValue.cta_label_en || '',
                ru: rawFormValue.cta_label_ru || '',
                ua: rawFormValue.cta_label_ua || ''
              },
              ctaUrl: rawFormValue.cta_url || '/shop',
              stats: (rawFormValue.stats || []).map((s: any) => ({
                value: s.value,
                label_en: s.label_en,
                label_ru: s.label_ru,
                label_ua: s.label_ua
              })),
              features: (rawFormValue.features || []).map((f: any) => ({
                icon: f.icon,
                iconUrl: f.iconUrl,
                text_en: f.text_en,
                text_ru: f.text_ru,
                text_ua: f.text_ua
              }))
            }
          };
        } else {
          const {
            logoUrl, showSearch, showCart, showProfile, menu, categories,
            stats, features, cta_label_en, cta_label_ru, cta_label_ua, cta_url,
            title_en, title_ru, title_ua,
            subtitle_en, subtitle_ru, subtitle_ua,
            content_en, content_ru, content_ua,
            ...sectionData
          } = rawFormValue;

          formData = {
            ...sectionData,
            title: formValue.title,
            subtitle: formValue.subtitle,
            content: formValue.content,
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
            error: () => {
              this.loading = false;
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
            error: () => {
              this.loading = false;
              this.snackBar.open('Error creating section', 'Close', { duration: 3000 });
            }
          });
        }
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Error processing section', 'Close', { duration: 3000 });
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  // ─── Helpers ──────────────────────────────────────────────────────────

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

    delete data.title_en; delete data.title_ru; delete data.title_ua;
    delete data.subtitle_en; delete data.subtitle_ru; delete data.subtitle_ua;
    delete data.content_en; delete data.content_ru; delete data.content_ua;

    return data;
  }
}
