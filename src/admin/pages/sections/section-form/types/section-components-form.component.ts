import { Component, Input, QueryList, ViewChildren } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { ImageUploadComponent } from '../../../../components/ui/image-upload/image-upload.component';
import { SectionService } from '../../../../services/section.service';
import { dropFormArrayItem, normalizeUploadedUrl } from '../shared/section-form-array.util';

@Component({
  selector: 'app-section-components-form',
  templateUrl: './section-components-form.component.html',
  styleUrls: ['../section-form.component.scss'],
})
export class SectionComponentsFormComponent {
  @Input({ required: true }) sectionForm!: FormGroup;
  @ViewChildren(ImageUploadComponent) imageUploadComponents!: QueryList<ImageUploadComponent>;

  uploadingImage = false;
  uploadingCategoryIcon = false;
  uploadingBrandLogo = false;

  constructor(
    private fb: FormBuilder,
    private sectionService: SectionService,
    private snackBar: MatSnackBar,
    private translate: TranslateService
  ) {}

  private dropFormArrayItem(array: FormArray, event: CdkDragDrop<FormArray>): void {
    dropFormArrayItem(array, event);
  }

  get categories(): FormArray {
    return this.sectionForm.get('categories') as FormArray;
  }

  get brands(): FormArray {
    return this.sectionForm.get('brands') as FormArray;
  }

  get testimonials(): FormArray {
    return this.sectionForm.get('testimonials') as FormArray;
  }

  get features(): FormArray {
    return this.sectionForm.get('features') as FormArray;
  }

  get faqItems(): FormArray {
    return this.sectionForm.get('faqItems') as FormArray;
  }

  get stats(): FormArray {
    return this.sectionForm.get('stats') as FormArray;
  }

  get lookbookSlides(): FormArray {
    return this.sectionForm.get('lookbookSlides') as FormArray;
  }

  get blogPosts(): FormArray {
    return this.sectionForm.get('blogPosts') as FormArray;
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

  addTestimonial() {
    this.testimonials.push(this.fb.group({
      name: ['', Validators.required],
      role: [''],
      text: ['', Validators.required],
      avatar: [''],
      rating: [5, [Validators.min(1), Validators.max(5)]],
      isActive: [true]
    }));
  }

  addFeature() {
    this.features.push(this.fb.group({
      icon: ['star', Validators.required],
      title: ['', Validators.required],
      description: ['', Validators.required],
      isActive: [true]
    }));
  }

  addFaqItem() {
    this.faqItems.push(this.fb.group({
      question: ['', Validators.required],
      answer: ['', Validators.required],
      isActive: [true]
    }));
  }

  addStat() {
    this.stats.push(this.fb.group({
      value: ['', Validators.required],
      label: ['', Validators.required],
      suffix: [''],
      isActive: [true]
    }));
  }

  addLookbookSlide() {
    this.lookbookSlides.push(this.fb.group({
      image: ['', Validators.required],
      title: ['', Validators.required],
      subtitle: [''],
      ctaLabel: [''],
      ctaUrl: ['/shop'],
      isActive: [true]
    }));
  }

  addBlogPost() {
    this.blogPosts.push(this.fb.group({
      title: ['', Validators.required],
      excerpt: [''],
      image: [''],
      date: [''],
      author: [''],
      category: [''],
      link: ['/shop'],
      isActive: [true]
    }));
  }

  removeCategory(index: number) {
    this.categories.removeAt(index);
  }

  removeBrand(index: number) {
    this.brands.removeAt(index);
  }

  removeTestimonial(index: number) {
    this.testimonials.removeAt(index);
  }

  removeFeature(index: number) {
    this.features.removeAt(index);
  }

  removeFaqItem(index: number) {
    this.faqItems.removeAt(index);
  }

  removeStat(index: number) {
    this.stats.removeAt(index);
  }

  removeLookbookSlide(index: number) {
    this.lookbookSlides.removeAt(index);
  }

  removeBlogPost(index: number) {
    this.blogPosts.removeAt(index);
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

  dropTestimonial(event: CdkDragDrop<FormArray>) {
    this.dropFormArrayItem(this.testimonials, event);
  }

  dropFeature(event: CdkDragDrop<FormArray>) {
    this.dropFormArrayItem(this.features, event);
  }

  dropFaqItem(event: CdkDragDrop<FormArray>) {
    this.dropFormArrayItem(this.faqItems, event);
  }

  dropStat(event: CdkDragDrop<FormArray>) {
    this.dropFormArrayItem(this.stats, event);
  }

  dropLookbookSlide(event: CdkDragDrop<FormArray>) {
    this.dropFormArrayItem(this.lookbookSlides, event);
  }

  dropBlogPost(event: CdkDragDrop<FormArray>) {
    this.dropFormArrayItem(this.blogPosts, event);
  }

  onLookbookSlideImageSelected(file: File, index: number): void {
    this.uploadingImage = true;
    this.sectionService.uploadImage(file).subscribe({
      next: (response) => {
        if (response?.url) {
          this.lookbookSlides.at(index).patchValue({ image: normalizeUploadedUrl(response.url) });
        }
        this.uploadingImage = false;
      },
      error: () => {
        this.uploadingImage = false;
        this.snackBar.open(this.translate.instant('ERROR_UPLOADING_IMAGE'), this.translate.instant('CLOSE_BTN'), { duration: 3000 });
      }
    });
  }

  onBlogPostImageSelected(file: File, index: number): void {
    this.uploadingImage = true;
    this.sectionService.uploadImage(file).subscribe({
      next: (response) => {
        if (response?.url) {
          this.blogPosts.at(index).patchValue({ image: normalizeUploadedUrl(response.url) });
        }
        this.uploadingImage = false;
      },
      error: () => {
        this.uploadingImage = false;
        this.snackBar.open(this.translate.instant('ERROR_UPLOADING_IMAGE'), this.translate.instant('CLOSE_BTN'), { duration: 3000 });
      }
    });
  }

  onTestimonialAvatarSelected(file: File, index: number): void {
    this.uploadingImage = true;
    this.sectionService.uploadImage(file).subscribe({
      next: (response) => {
        if (response?.url) {
          this.testimonials.at(index).patchValue({ avatar: normalizeUploadedUrl(response.url) });
        }
        this.uploadingImage = false;
      },
      error: () => {
        this.uploadingImage = false;
        this.snackBar.open(this.translate.instant('ERROR_UPLOADING_IMAGE'), this.translate.instant('CLOSE_BTN'), { duration: 3000 });
      }
    });
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
        this.snackBar.open(this.translate.instant('ERROR_UPLOADING_CATEGORY_ICON'), this.translate.instant('CLOSE_BTN'), { duration: 3000 });
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
        this.snackBar.open(this.translate.instant('ERROR_UPLOADING_BRAND_LOGO'), this.translate.instant('CLOSE_BTN'), { duration: 3000 });
        this.uploadingBrandLogo = false;
      }
    });
  }

  onBrandLogoUploaded(url: string, index: number): void {
    this.brands.at(index).patchValue({ logo: url });
  }

  onTestimonialAvatarUploaded(url: string, index: number): void {
    this.testimonials.at(index).patchValue({ avatar: url });
  }

  onLookbookSlideImageUploaded(url: string, index: number): void {
    this.lookbookSlides.at(index).patchValue({ image: url });
  }

  onBlogPostImageUploaded(url: string, index: number): void {
    this.blogPosts.at(index).patchValue({ image: url });
  }

  removeBrandLogo(index: number): void {
    this.brands.at(index).patchValue({ logo: '' });
  }
}
