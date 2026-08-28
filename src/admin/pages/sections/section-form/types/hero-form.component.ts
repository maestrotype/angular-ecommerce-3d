import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { SectionService } from '../../../../services/section.service';
import { normalizeUploadedUrl } from '../shared/section-form-array.util';

@Component({
  selector: 'app-section-hero-form',
  templateUrl: './hero-form.component.html',
  styleUrls: ['../section-form.component.scss'],
})
export class SectionHeroFormComponent {
  @Input({ required: true }) sectionForm!: FormGroup;
  @Input() activeMenuLang = 'en';
  @Input() model3dFileName: string | null = null;
  @Input() showComponentsTab = false;

  uploadingImage = false;
  model3dFile: File | null = null;

  constructor(
    private sectionService: SectionService,
    private snackBar: MatSnackBar,
    private translate: TranslateService
  ) {}

  onImageFileSelected(file: File): void {
    this.uploadingImage = true;
    this.sectionService.uploadImage(file).subscribe({
      next: (response) => {
        if (response?.url) {
          this.sectionForm.patchValue({
            imageUrl: normalizeUploadedUrl(response.url),
          });
        }
        this.uploadingImage = false;
      },
      error: () => {
        this.uploadingImage = false;
        this.snackBar.open(
          this.translate.instant('ERROR_UPLOADING_IMAGE'),
          this.translate.instant('CLOSE_BTN'),
          { duration: 3000 }
        );
      },
    });
  }

  onImageUploaded(url: string): void {
    this.sectionForm.patchValue({ imageUrl: url });
  }

  on3dFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (!file.name.toLowerCase().endsWith('.glb')) {
        this.snackBar.open(
          this.translate.instant('SELECT_VALID_GLB'),
          this.translate.instant('CLOSE_BTN'),
          { duration: 3000 }
        );
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        this.snackBar.open(
          this.translate.instant('MODEL_3D_SIZE_LIMIT'),
          this.translate.instant('CLOSE_BTN'),
          { duration: 3000 }
        );
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
    this.model3dFileName = null;
    this.sectionForm.patchValue({ model3dUrl: '' });
  }

  /** Called by parent before submit when a new GLB file was selected. */
  consumePendingModelFile(): File | null {
    const file = this.model3dFile;
    this.model3dFile = null;
    return file;
  }
}
