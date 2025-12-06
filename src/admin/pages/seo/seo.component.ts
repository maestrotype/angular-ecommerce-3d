import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { AdminSeoService, SeoSettings, UpdateSeoSettingsDto } from '../../../app/core/services/admin-seo.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-seo',
  templateUrl: './seo.component.html',
  styleUrls: ['./seo.component.scss']
})
export class SeoComponent implements OnInit, OnDestroy {
  seoForm: FormGroup;
  robotsTxtForm: FormGroup;
  loading = false;
  saving = false;
  currentSettings: SeoSettings | null = null;
  selectedTab = 0;
  
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private seoService: AdminSeoService,
    private snackBar: MatSnackBar
  ) {
    this.seoForm = this.fb.group({
      siteName: ['', [Validators.required, Validators.maxLength(60)]],
      siteDescription: ['', [Validators.required, Validators.maxLength(160)]],
      siteKeywords: ['', [Validators.required, Validators.maxLength(500)]],
      siteUrl: ['', [Validators.required, Validators.pattern('https?://.+')]],
      defaultLanguage: ['en', [Validators.required, Validators.maxLength(10)]],
      defaultOgImage: [''],
      ogSiteName: ['', [Validators.maxLength(60)]],
      twitterHandle: ['', [Validators.maxLength(15)]],
      googleAnalyticsId: [''],
      googleSearchConsole: [''],
      bingWebmasterTools: [''],
      enableSitemap: [true],
      enableStructuredData: [true]
    });

    this.robotsTxtForm = this.fb.group({
      robotsTxtContent: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.loadSeoSettings();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadSeoSettings(): void {
    this.loading = true;
    this.seoService.getSeoSettings()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (settings) => {
          this.currentSettings = settings;
          this.seoForm.patchValue({
            siteName: settings.siteName,
            siteDescription: settings.siteDescription,
            siteKeywords: settings.siteKeywords,
            siteUrl: settings.siteUrl,
            defaultLanguage: settings.defaultLanguage,
            defaultOgImage: settings.defaultOgImage || '',
            ogSiteName: settings.ogSiteName || '',
            twitterHandle: settings.twitterHandle || '',
            googleAnalyticsId: settings.googleAnalyticsId || '',
            googleSearchConsole: settings.googleSearchConsole || '',
            bingWebmasterTools: settings.bingWebmasterTools || '',
            enableSitemap: settings.enableSitemap,
            enableStructuredData: settings.enableStructuredData
          });

          this.robotsTxtForm.patchValue({
            robotsTxtContent: settings.robotsTxtContent || ''
          });

          this.loading = false;
        },
        error: (error) => {
          
          this.snackBar.open('Failed to load SEO settings', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
          this.loading = false;
        }
      });
  }

  onSaveSeoSettings(): void {
    if (this.seoForm.valid) {
      this.saving = true;
      const settings: UpdateSeoSettingsDto = this.seoForm.value;
      
      this.seoService.updateSeoSettings(settings)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (updatedSettings) => {
            this.currentSettings = updatedSettings;
            this.saving = false;
            this.snackBar.open('SEO settings saved successfully!', 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
          },
          error: (error) => {
            
            this.saving = false;
            this.snackBar.open('Failed to save SEO settings', 'Close', {
              duration: 3000,
              panelClass: ['error-snackbar']
            });
          }
        });
    }
  }

  onSaveRobotsTxt(): void {
    if (this.robotsTxtForm.valid) {
      const content = this.robotsTxtForm.get('robotsTxtContent')?.value;
      
      this.seoService.updateRobotsTxt(content)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.snackBar.open('Robots.txt updated successfully!', 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
          },
          error: (error) => {
            
            this.snackBar.open('Failed to update robots.txt', 'Close', {
              duration: 3000,
              panelClass: ['error-snackbar']
            });
          }
        });
    }
  }

  onGenerateSitemap(): void {
    this.seoService.generateSitemap()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.snackBar.open(result.message, 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        },
        error: (error) => {
          
          this.snackBar.open('Failed to generate sitemap', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
  }

  getCharacterCount(fieldName: string): number {
    const value = this.seoForm.get(fieldName)?.value || '';
    return value.length;
  }

  getMaxLength(fieldName: string): number {
    const control = this.seoForm.get(fieldName);
    return control?.errors?.['maxlength']?.requiredLength || 0;
  }

  isFieldValid(fieldName: string): boolean {
    const control = this.seoForm.get(fieldName);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }

  getFieldError(fieldName: string): string {
    const control = this.seoForm.get(fieldName);
    if (control?.errors) {
      if (control.errors['required']) return 'This field is required';
      if (control.errors['maxlength']) return `Maximum ${control.errors['maxlength'].requiredLength} characters`;
      if (control.errors['pattern']) return 'Invalid format';
    }
    return '';
  }
} 