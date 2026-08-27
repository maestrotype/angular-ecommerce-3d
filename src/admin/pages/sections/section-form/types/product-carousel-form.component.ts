import { Component, Input } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { MatChipListboxChange } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { Category } from '../../../../models/category.model';
import { SectionService } from '../../../../services/section.service';
import { CAROUSEL_SORT_OPTIONS } from '../shared/section-form.constants';
import {
  dropFormArrayItemMove,
  normalizeUploadedUrl,
} from '../shared/section-form-array.util';

@Component({
  selector: 'app-section-product-carousel-form',
  templateUrl: './product-carousel-form.component.html',
  styleUrls: ['../section-form.component.scss'],
})
export class SectionProductCarouselFormComponent {
  @Input({ required: true }) sectionForm!: FormGroup;
  @Input() activeMenuLang = 'en';
  @Input() productFilterCategories: Category[] = [];

  uploadingImage = false;
  readonly carouselSortOptions = CAROUSEL_SORT_OPTIONS;

  constructor(
    private fb: FormBuilder,
    private sectionService: SectionService,
    private snackBar: MatSnackBar,
    private translate: TranslateService
  ) {}

  get carouselSlides(): FormArray {
    return this.sectionForm.get('carouselSlides') as FormArray;
  }

  getProductCategorySlug(category: Category): string {
    const name =
      typeof category.name === 'string'
        ? category.name
        : category.name?.en || '';
    return (
      category.slug ||
      name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    );
  }

  onCarouselCategoriesChange(event: MatChipListboxChange): void {
    const value = Array.isArray(event.value)
      ? event.value
      : event.value
        ? [event.value]
        : [];
    this.sectionForm.get('carouselCategories')?.setValue(value);
  }

  addCarouselSlide(): void {
    this.carouselSlides.push(
      this.fb.group({
        image: ['', Validators.required],
        title: ['', Validators.required],
        subtitle: [''],
        link: ['/shop'],
        price: [''],
        isActive: [true],
      })
    );
  }

  removeCarouselSlide(index: number): void {
    this.carouselSlides.removeAt(index);
  }

  dropCarouselSlide(event: CdkDragDrop<FormArray>): void {
    dropFormArrayItemMove(this.carouselSlides, event);
  }

  onCarouselSlideImageSelected(file: File, index: number): void {
    this.uploadingImage = true;
    this.sectionService.uploadImage(file).subscribe({
      next: (response) => {
        if (response?.url) {
          this.carouselSlides
            .at(index)
            .patchValue({ image: normalizeUploadedUrl(response.url) });
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

  onCarouselSlideImageUploaded(url: string, index: number): void {
    this.carouselSlides.at(index).patchValue({ image: url });
  }
}
