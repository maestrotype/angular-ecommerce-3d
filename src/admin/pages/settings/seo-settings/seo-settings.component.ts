import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { AdminSeoService, SeoSettings, UpdateSeoSettingsDto } from '../../../../app/core/services/admin-seo.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-seo-settings',
  templateUrl: './seo-settings.component.html',
  styleUrls: ['./seo-settings.component.scss']
})
export class SeoSettingsComponent implements OnInit, OnDestroy {
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
    private snackBar: MatSnackBar,
    private translate: TranslateService
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
          
          this.snackBar.open(this.translate.instant('FAILED_TO_LOAD_SEO'), this.translate.instant('CLOSE_BTN'), {
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
            this.snackBar.open(this.translate.instant('SEO_SETTINGS_SAVED_MSG'), this.translate.instant('CLOSE_BTN'), {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
          },
          error: (error) => {
            
            this.saving = false;
            this.snackBar.open(this.translate.instant('FAILED_TO_SAVE_SEO'), this.translate.instant('CLOSE_BTN'), {
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
          next: (result) => {
            if (result.success) {
              this.snackBar.open(this.translate.instant('ROBOTS_TXT_UPDATED'), this.translate.instant('CLOSE_BTN'), {
                duration: 3000,
                panelClass: ['success-snackbar']
              });
            }
          },
          error: (error) => {
            
            this.snackBar.open(this.translate.instant('FAILED_TO_UPDATE_ROBOTS'), this.translate.instant('CLOSE_BTN'), {
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
          if (result.success) {
            this.snackBar.open(result.message, 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
          }
        },
        error: (error) => {
          
          this.snackBar.open(this.translate.instant('FAILED_TO_GENERATE_SITEMAP'), this.translate.instant('CLOSE_BTN'), {
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
    const maxLengthValidator = control?.errors?.['maxlength'];
    return maxLengthValidator?.requiredLength || 0;
  }

  isFieldValid(fieldName: string): boolean {
    const field = this.seoForm.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.seoForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return this.translate.instant('FIELD_REQUIRED');
      if (field.errors['maxlength']) return this.translate.instant('FIELD_MAX_LENGTH', { length: field.errors['maxlength'].requiredLength });
      if (field.errors['pattern']) return this.translate.instant('FIELD_INVALID_URL');
    }
    return '';
  }
} 