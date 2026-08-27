import {
  Component, Inject, ViewChild, AfterViewInit, Input, Output, EventEmitter, Optional, OnInit,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { of, Observable, throwError } from 'rxjs';
import { switchMap, catchError, finalize, map } from 'rxjs/operators';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { take } from 'rxjs/operators';
import { SectionService } from '../../../services/section.service';
import { PageService } from '../../../services/page.service';
import { CategoryService } from 'src/app/core/services/category.service';
import { Category } from '../../../models/category.model';
import { Section } from '../../../models/section.model';
import { ConfirmationService } from '../../../services/confirmation.service';
import { getSectionPreset } from '../section-presets';
import { resolveApiError, formatResolvedApiError } from '../../../../shared/utils/localization.util';
import { createSectionForm } from './shared/section-form.factory';
import { packLocalizedFields } from './shared/section-form-localization.util';
import { buildSectionSubmitPayload } from './shared/section-form-submit.util';
import { applySectionPresetToForm } from './shared/section-form-preset.util';
import { normalizeUploadedUrl } from './shared/section-form-array.util';
import {
  SECTION_TYPES, STATIC_PAGE_TARGETS, COMPONENT_SECTION_TYPES,
} from './shared/section-form.constants';
import { SectionHeroFormComponent } from './types/hero-form.component';

@Component({
  selector: 'app-section-form',
  templateUrl: './section-form.component.html',
  styleUrls: ['./section-form.component.scss'],
})
export class SectionFormComponent implements AfterViewInit, OnInit {
  @Input() data: { section: Section | null } = { section: null };
  @Input() isDrawerMode = false;
  @Output() formChanged = new EventEmitter<any>();
  @Output() saved = new EventEmitter<any>();
  @Output() cancelled = new EventEmitter<void>();
  @ViewChild(SectionHeroFormComponent) heroForm?: SectionHeroFormComponent;

  sectionForm!: FormGroup;
  isEditMode = false;
  loading = false;
  uploadingVideo = false;
  uploading3d = false;
  uploadingImage = false;
  videoFileName: string | null = null;
  model3dFileName: string | null = null;
  model3dFile: File | null = null;

  private _activeMenuLang = localStorage.getItem('admin_menu_lang') || 'en';
  @Input() set activeMenuLang(val: string) {
    if (val && this._activeMenuLang !== val) {
      this._activeMenuLang = val;
      localStorage.setItem('admin_menu_lang', val);
    }
  }
  get activeMenuLang() { return this._activeMenuLang; }

  sectionTypes = SECTION_TYPES;
  pageTargets: { value: string; label: string; translate?: boolean }[] = [
    ...STATIC_PAGE_TARGETS,
  ];
  productFilterCategories: Category[] = [];
  readonly componentSectionTypes = COMPONENT_SECTION_TYPES;

  constructor(
    private fb: FormBuilder,
    private sectionService: SectionService,
    private pageService: PageService,
    private categoryService: CategoryService,
    private snackBar: MatSnackBar,
    private translate: TranslateService,
    private confirmationService: ConfirmationService,
    @Optional() public dialogRef: MatDialogRef<SectionFormComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public dialogData: { section: Section | null },
  ) {}

  ngOnInit(): void {
    const dataSource = this.isDrawerMode ? this.data : this.dialogData;
    this.isEditMode = !!dataSource?.section?.id;
    this.sectionForm = createSectionForm(this.fb, dataSource?.section);

    if (this.isEditMode && dataSource?.section?.model3dUrl) {
      this.model3dFileName = dataSource.section.model3dUrl.split('/').pop() || null;
    }

    const videoUrl = (dataSource?.section?.settings as any)?.videoUrl || this.sectionForm.get('videoUrl')?.value;
    if (videoUrl) {
      this.videoFileName = videoUrl.split('/').pop()?.split('?')[0] || null;
    }

    this.loadPageTargets();
    this.loadCategories();

    this.sectionForm.valueChanges.subscribe((val) => {
      const packed = packLocalizedFields(val);
      this.formChanged.emit({ ...val, ...packed });
    });

    if (!dataSource?.section?.id) {
      const type = this.sectionForm.get('type')?.value;
      const preset = type ? getSectionPreset(type) : null;
      if (preset) {
        this.applyPresetToForm(preset);
      }
    }
  }

  ngAfterViewInit(): void {}

  onLangChange(lang: string): void {
    this.activeMenuLang = lang;
  }

  trackByFn(index: number): number {
    return index;
  }

  showComponentsTab(): boolean {
    return (this.componentSectionTypes as readonly string[]).includes(
      this.sectionForm.get('type')?.value
    );
  }

  private loadPageTargets(): void {
    this.pageService.getPagesForAdmin().subscribe((pages) => {
      const staticTargets = [...STATIC_PAGE_TARGETS];
      const pageTargets = pages.map((page) => ({
        value: page.slug,
        label: typeof page.title === 'string' ? page.title : (page.title?.en || page.slug),
        translate: false,
      }));
      this.pageTargets = [...staticTargets, ...pageTargets];
      const currentTarget = this.sectionForm.get('pageTarget')?.value;
      if (currentTarget && !this.pageTargets.some((t) => t.value === currentTarget)) {
        this.pageTargets.push({ value: currentTarget, label: currentTarget, translate: false });
      }
    });
  }

  private loadCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (categories) => { this.productFilterCategories = categories; },
    });
  }

  private applyPresetToForm(preset: import('../section-presets').SectionPresetFormPatch): void {
    applySectionPresetToForm(this.sectionForm, this.fb, preset, (name) => {
      this.videoFileName = name;
    });
  }

  onPosterFileSelected(file: File): void {
    this.sectionService.uploadImage(file).subscribe({
      next: (response) => {
        if (response?.url) {
          this.sectionForm.patchValue({
            imageUrl: normalizeUploadedUrl(response.url),
          });
        }
      },
      error: () => {
        this.snackBar.open(
          this.translate.instant('ERROR_UPLOADING_IMAGE'),
          this.translate.instant('CLOSE_BTN'),
          { duration: 3000 }
        );
      },
    });
  }

  onPosterUploaded(url: string): void {
    this.sectionForm.patchValue({ imageUrl: url });
  }

  onVideoFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    const allowed = ['video/mp4', 'video/webm', 'video/quicktime'];
    if (!allowed.includes(file.type)) {
      this.snackBar.open(this.translate.instant('INVALID_VIDEO_FORMAT'), this.translate.instant('CLOSE_BTN'), { duration: 3000 });
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      this.snackBar.open(this.translate.instant('VIDEO_SIZE_LIMIT'), this.translate.instant('CLOSE_BTN'), { duration: 3000 });
      return;
    }

    this.uploadingVideo = true;
    this.sectionService.uploadVideo(file).subscribe({
      next: (response) => {
        if (response?.url) {
          const videoUrl = normalizeUploadedUrl(response.url);
          this.sectionForm.patchValue({ videoUrl });
          this.videoFileName = file.name;
        }
        this.uploadingVideo = false;
      },
      error: () => {
        this.uploadingVideo = false;
        this.snackBar.open(this.translate.instant('ERROR_UPLOADING_VIDEO'), this.translate.instant('CLOSE_BTN'), { duration: 3000 });
      }
    });
  }

  removeVideo(): void {
    this.sectionForm.patchValue({ videoUrl: '' });
    this.videoFileName = null;
  }

  private upload3dIfSelected(): Observable<string | null> {
    this.syncModel3dFromHero();
    if (!this.model3dFile) {
      return of(this.sectionForm.value.model3dUrl || null);
    }

    this.uploading3d = true;
    return this.sectionService.upload3dModel(this.model3dFile).pipe(
      map((response) => {
        this.uploading3d = false;
        if (response?.url) {
          const model3dUrl = normalizeUploadedUrl(response.url);
          this.sectionForm.patchValue({ model3dUrl });
          return model3dUrl;
        }
        return null;
      }),
      catchError((error) => {
        this.uploading3d = false;
        const resolved = resolveApiError(error, this.translate, {
          titleKey: 'ERROR_UPLOADING_3D_MODEL',
        });
        this.snackBar.open(
          formatResolvedApiError(resolved),
          this.translate.instant('CLOSE_BTN'),
          { duration: resolved.duration, panelClass: resolved.panelClass }
        );
        return throwError(() => error);
      })
    );
  }

  onSubmit(): void {
    if (this.sectionForm.invalid) {
      this.sectionForm.markAllAsTouched();
      this.snackBar.open(this.translate.instant('FILL_REQUIRED_FIELDS_SECTION'), this.translate.instant('CLOSE_BTN'), { duration: 3000 });
      return;
    }

    this.loading = true;
    this.upload3dIfSelected().subscribe({
      next: (model3dUrl) => {
        const rawFormValue = this.sectionForm.getRawValue();
        const formValue = packLocalizedFields(rawFormValue);
        const dataSource = this.isDrawerMode ? this.data : this.dialogData;
        const existingSettings = dataSource?.section?.settings || {};
        const formData = buildSectionSubmitPayload(formValue, existingSettings as Record<string, any>, model3dUrl);

        const request$ = this.isEditMode && dataSource?.section?.id
          ? this.sectionService.updateSection(dataSource.section.id, formData)
          : this.sectionService.createSection(formData);

        request$.pipe(finalize(() => { this.loading = false; })).subscribe({
          next: (result) => {
            const msg = this.isEditMode ? 'SECTION_UPDATED_SUCCESSFULLY' : 'SECTION_CREATED_SUCCESSFULLY';
            this.snackBar.open(this.translate.instant(msg), this.translate.instant('CLOSE_BTN'), { duration: 3000 });
            if (this.isDrawerMode) this.saved.emit(result);
            else this.dialogRef.close(result);
          },
          error: () => {
            const msg = this.isEditMode ? 'ERROR_UPDATING_SECTION' : 'ERROR_CREATING_SECTION';
            this.snackBar.open(this.translate.instant(msg), this.translate.instant('CLOSE_BTN'), { duration: 3000 });
          },
        });
      },
      error: () => {
        this.loading = false;
        this.snackBar.open(this.translate.instant('ERROR_PROCESSING_SECTION'), this.translate.instant('CLOSE_BTN'), { duration: 3000 });
      },
    });
  }

  onCancel(): void {
    if (this.isDrawerMode) this.cancelled.emit();
    else this.dialogRef.close();
  }

  loadDemoContent(): void {
    const type = this.sectionForm.get('type')?.value;
    const preset = getSectionPreset(type);
    if (!preset) {
      this.snackBar.open(this.translate.instant('DEMO_CONTENT_NOT_AVAILABLE'), this.translate.instant('CLOSE_BTN'), { duration: 3000 });
      return;
    }
    const apply = () => {
      this.applyPresetToForm(preset);
      this.snackBar.open(this.translate.instant('DEMO_CONTENT_LOADED'), this.translate.instant('CLOSE_BTN'), { duration: 3000 });
    };
    if (this.isEditMode) {
      this.confirmationService.confirmAction(this.translate.instant('FILL_DEMO_DATA'), this.translate.instant('SECTION'))
        .pipe(take(1)).subscribe((confirmed) => { if (confirmed) apply(); });
      return;
    }
    apply();
  }

  syncModel3dFromHero(): void {
    const pending = this.heroForm?.consumePendingModelFile?.();
    if (pending) {
      this.model3dFile = pending;
      this.model3dFileName = pending.name;
    }
  }
}
