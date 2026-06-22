import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { PageService } from '../../../services/page.service';
import { PageTemplate, PageStatus } from 'src/shared/models/page.model';

@Component({
  selector: 'app-page-form',
  templateUrl: './page-form.component.html',
  styleUrls: ['./page-form.component.scss'],
})
export class PageFormComponent implements OnInit {
  pageForm: FormGroup;
  isEditMode = false;
  isLoading = false;
  pageId: number | null = null;
  activeLang: 'en' | 'ru' | 'ua' = 'en';

  templates: { value: PageTemplate; label: string }[] = [
    { value: 'simple', label: 'PAGE_TEMPLATE_SIMPLE' },
    { value: 'sections', label: 'PAGE_TEMPLATE_SECTIONS' },
    { value: 'contact', label: 'PAGE_TEMPLATE_CONTACT' },
  ];

  statuses: { value: PageStatus; label: string }[] = [
    { value: 'draft', label: 'PAGE_STATUS_DRAFT' },
    { value: 'published', label: 'PAGE_STATUS_PUBLISHED' },
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private pageService: PageService,
    private snackBar: MatSnackBar,
    private translate: TranslateService,
  ) {
    this.pageForm = this.fb.group({
      slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)]],
      title_en: ['', Validators.required],
      title_ru: [''],
      title_ua: [''],
      content_en: [''],
      content_ru: [''],
      content_ua: [''],
      seoDescription_en: [''],
      seoDescription_ru: [''],
      seoDescription_ua: [''],
      template: ['simple', Validators.required],
      status: ['draft', Validators.required],
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.pageId = +params['id'];
        this.isEditMode = true;
        this.pageForm.get('slug')?.disable();
        this.loadPage(this.pageId);
      }
    });

    this.pageForm.get('template')?.valueChanges.subscribe(template => {
      this.updateContentValidators(template);
    });
  }

  private updateContentValidators(template: PageTemplate): void {
    const required = template === 'simple';
    ['content_en', 'content_ru', 'content_ua'].forEach(field => {
      const control = this.pageForm.get(field);
      if (!control) return;
      control.setValidators(required && field === 'content_en' ? [Validators.required] : []);
      control.updateValueAndValidity({ emitEvent: false });
    });
  }

  loadPage(id: number): void {
    this.isLoading = true;
    this.pageService.getPageById(id).subscribe({
      next: (page) => {
        this.pageForm.patchValue({
          slug: page.slug,
          title_en: this.getLocalized(page.title, 'en'),
          title_ru: this.getLocalized(page.title, 'ru'),
          title_ua: this.getLocalized(page.title, 'ua'),
          content_en: this.getLocalized(page.content, 'en'),
          content_ru: this.getLocalized(page.content, 'ru'),
          content_ua: this.getLocalized(page.content, 'ua'),
          seoDescription_en: this.getLocalized(page.seoDescription, 'en'),
          seoDescription_ru: this.getLocalized(page.seoDescription, 'ru'),
          seoDescription_ua: this.getLocalized(page.seoDescription, 'ua'),
          template: page.template,
          status: page.status,
        });
        this.updateContentValidators(page.template);
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.snackBar.open(this.translate.instant('PAGES_LOAD_ERROR'), this.translate.instant('CLOSE_BTN'), { duration: 5000 });
      },
    });
  }

  onSubmit(): void {
    if (this.pageForm.invalid) {
      this.pageForm.markAllAsTouched();
      this.snackBar.open(this.translate.instant('FILL_REQUIRED_FIELDS'), this.translate.instant('CLOSE_BTN'), { duration: 3000 });
      return;
    }

    const v = this.pageForm.getRawValue();
    const payload = {
      slug: v.slug,
      title: { en: v.title_en, ru: v.title_ru, ua: v.title_ua },
      content: { en: v.content_en, ru: v.content_ru, ua: v.content_ua },
      seoDescription: { en: v.seoDescription_en, ru: v.seoDescription_ru, ua: v.seoDescription_ua },
      template: v.template,
      status: v.status,
    };

    this.isLoading = true;
    const request$ = this.isEditMode && this.pageId
      ? this.pageService.updatePage(this.pageId, payload)
      : this.pageService.createPage(payload);

    request$.subscribe({
      next: (page) => {
        this.snackBar.open(
          this.translate.instant(this.isEditMode ? 'PAGE_UPDATED' : 'PAGE_CREATED'),
          this.translate.instant('CLOSE_BTN'),
          { duration: 3000 },
        );
        if (!this.isEditMode && page.template === 'sections') {
          this.router.navigate(['/admin/sections'], { queryParams: { pageTarget: page.slug, createIfMissing: true } });
          return;
        }
        this.router.navigate(['/admin/pages']);
      },
      error: (err) => {
        this.isLoading = false;
        const message = err?.error?.message || this.translate.instant('PAGE_SAVE_ERROR');
        this.snackBar.open(message, this.translate.instant('CLOSE_BTN'), { duration: 5000 });
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/admin/pages']);
  }

  setLang(lang: 'en' | 'ru' | 'ua'): void {
    this.activeLang = lang;
  }

  private getLocalized(value: any, lang: string): string {
    if (!value) return '';
    if (typeof value === 'string') return value;
    return value[lang] || value.en || '';
  }
}
