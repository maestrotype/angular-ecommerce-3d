import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SettingsService } from '../../services/settings.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  generalForm: FormGroup;
  notificationForm: FormGroup;
  securityForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private settingsService: SettingsService,
    private snackBar: MatSnackBar,
    private translate: TranslateService
  ) {
    this.generalForm = this.fb.group({
      siteName: ['E-Commerce Admin', Validators.required],
      siteDescription: ['Admin panel for e-commerce management'],
      currency: ['USD', Validators.required],
      timezone: ['UTC', Validators.required],
      language: ['en', Validators.required]
    });

    this.notificationForm = this.fb.group({
      emailNotifications: [true],
      orderNotifications: [true],
      stockAlerts: [true],
      userRegistrations: [true],
      systemUpdates: [false]
    });

    this.securityForm = this.fb.group({
      twoFactorAuth: [false],
      sessionTimeout: [30, [Validators.required, Validators.min(5), Validators.max(120)]],
      passwordExpiry: [90, [Validators.required, Validators.min(30), Validators.max(365)]],
      maxLoginAttempts: [5, [Validators.required, Validators.min(3), Validators.max(10)]]
    });

    const savedLang = localStorage.getItem('adminLang') || 'en';
    this.translate.setDefaultLang(savedLang);
    this.translate.use(savedLang);
    this.generalForm.get('language')?.setValue(savedLang);
  }

  ngOnInit(): void {
    this.loadSettings();
  }

  onLanguageChange(lang: string) {
    this.translate.use(lang);
    localStorage.setItem('adminLang', lang);
  }

  loadSettings(): void {
    this.settingsService.getSettings().subscribe({
      next: (settings) => {
        if (settings.general) {
          this.generalForm.patchValue(settings.general);
        }
        if (settings.notifications) {
          this.notificationForm.patchValue(settings.notifications);
        }
        if (settings.security) {
          this.securityForm.patchValue(settings.security);
        }
      },
      error: (error) => {
        console.error('Failed to load settings:', error);
      }
    });
  }

  onSaveGeneral(): void {
    if (this.generalForm.valid) {
      this.isLoading = true;
      this.settingsService.updateGeneralSettings(this.generalForm.value).subscribe({
        next: () => {
          this.snackBar.open('General settings updated successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.isLoading = false;
        },
        error: (error) => {
          this.snackBar.open('Failed to update general settings', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
          this.isLoading = false;
        }
      });
    }
  }

  onSaveNotifications(): void {
    this.isLoading = true;
    this.settingsService.updateNotificationSettings(this.notificationForm.value).subscribe({
      next: () => {
        this.snackBar.open('Notification settings updated successfully', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.isLoading = false;
      },
      error: (error) => {
        this.snackBar.open('Failed to update notification settings', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.isLoading = false;
      }
    });
  }

  onSaveSecurity(): void {
    if (this.securityForm.valid) {
      this.isLoading = true;
      this.settingsService.updateSecuritySettings(this.securityForm.value).subscribe({
        next: () => {
          this.snackBar.open('Security settings updated successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.isLoading = false;
        },
        error: (error) => {
          this.snackBar.open('Failed to update security settings', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
          this.isLoading = false;
        }
      });
    }
  }
}