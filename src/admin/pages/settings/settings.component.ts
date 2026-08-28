import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SettingsService } from '../../services/settings.service';
import { TranslateService } from '@ngx-translate/core';
import { resolveUiLanguage } from 'src/shared/utils/ui-language.util';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  generalForm: FormGroup;
  notificationForm: FormGroup;
  securityForm: FormGroup;
  paymentForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private settingsService: SettingsService,
    private snackBar: MatSnackBar,
    private translate: TranslateService
  ) {
    // Forms will be initialized in ngOnInit
  }

  ngOnInit(): void {
    try {
      this.initializeForms();
      
      const savedLang = resolveUiLanguage(localStorage.getItem('adminLang') || 'en');
      this.translate.setDefaultLang('en');
      this.translate.use(savedLang);
      
      // Load settings after forms are initialized
      this.loadSettings();
    } catch (error) {
      
    }
  }

  private initializeForms(): void {
    try {
      this.generalForm = this.fb.group({
        siteName: ['E-Commerce Admin', Validators.required],
        siteDescription: ['Admin panel for e-commerce management'],
        currency: ['USD', Validators.required],
        timezone: ['UTC', Validators.required],
        language: ['en', Validators.required],
        viewerDefaultQuality: ['optimized', Validators.required]
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

      this.paymentForm = this.fb.group({
        stripeEnabled: [false],
        stripeTestMode: [true],
        stripePublishableKey: [''],
        stripeSecretKey: [''],
        stripeWebhookSecret: [''],
        liqpayEnabled: [false],
        liqpayTestMode: [true],
        liqpayPublicKey: [''],
        liqpayPrivateKey: [''],
        paypalEnabled: [false],
        paypalTestMode: [true],
        paypalClientId: [''],
        paypalClientSecret: [''],
        defaultPaymentMethod: ['stripe', Validators.required]
      });

      
    } catch (error) {
      
      // Create minimal forms as fallback
      this.generalForm = this.fb.group({});
      this.notificationForm = this.fb.group({});
      this.securityForm = this.fb.group({});
      this.paymentForm = this.fb.group({});
    }
  }

  onLanguageChange(lang: string) {
    const uiLang = resolveUiLanguage(lang);
    this.translate.use(uiLang);
    localStorage.setItem('adminLang', uiLang);
    
    // Update form value if form exists
    if (this.generalForm && this.generalForm.get('language')) {
      this.generalForm.get('language')?.setValue(uiLang);
    }
  }

  loadSettings(): void {
    this.isLoading = true;
    this.settingsService.getSettings().subscribe({
      next: (settings) => {
        try {
          
          
          // Patch form values directly since forms are already initialized
          if (settings.general && this.generalForm) {
            this.generalForm.patchValue(settings.general);
          }
          if (settings.notifications && this.notificationForm) {
            this.notificationForm.patchValue(settings.notifications);
          }
          if (settings.security && this.securityForm) {
            this.securityForm.patchValue(settings.security);
          }
          if (settings.payment && this.paymentForm) {
            this.paymentForm.patchValue(settings.payment);
          }
          
          // Set language from settings or localStorage
          const savedLang = localStorage.getItem('adminLang') || settings.general?.language || 'en';
          if (this.generalForm && this.generalForm.get('language')) {
            this.generalForm.get('language')?.setValue(savedLang);
          }
          
          this.isLoading = false;
        } catch (error) {
          
          this.isLoading = false;
        }
      },
      error: (error) => {
        
        this.isLoading = false;
      }
    });
  }

  onSaveGeneral(): void {
    try {
      if (!this.generalForm || !this.generalForm.valid) {
        this.snackBar.open(this.translate.instant('FILL_REQUIRED_FIELDS'), this.translate.instant('CLOSE_BTN'), {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        return;
      }
      
      this.isLoading = true;
      this.settingsService.updateGeneralSettings(this.generalForm.value).subscribe({
        next: (response) => {
          
          this.snackBar.open(this.translate.instant('GENERAL_SETTINGS_UPDATED'), this.translate.instant('CLOSE_BTN'), {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.isLoading = false;
        },
        error: (error) => {
          
          this.snackBar.open(this.translate.instant('FAILED_TO_UPDATE_SETTINGS') + `: ${error.error?.message || error.message || 'Unknown error'}`, this.translate.instant('CLOSE_BTN'), {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          this.isLoading = false;
        }
      });
    } catch (error) {
      
      this.snackBar.open(this.translate.instant('UNEXPECTED_ERROR'), this.translate.instant('CLOSE_BTN'), {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      this.isLoading = false;
    }
  }

  onSaveNotifications(): void {
    try {
      if (!this.notificationForm) {
        this.snackBar.open(this.translate.instant('NOTIFICATION_FORM_NOT_INIT'), this.translate.instant('CLOSE_BTN'), {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        return;
      }
      
      this.isLoading = true;
      this.settingsService.updateNotificationSettings(this.notificationForm.value).subscribe({
        next: (response) => {
          
          this.snackBar.open(this.translate.instant('NOTIFICATION_SETTINGS_UPDATED'), this.translate.instant('CLOSE_BTN'), {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.isLoading = false;
        },
        error: (error) => {
          
          this.snackBar.open(this.translate.instant('FAILED_TO_UPDATE_SETTINGS') + `: ${error.error?.message || error.message || 'Unknown error'}`, this.translate.instant('CLOSE_BTN'), {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          this.isLoading = false;
        }
      });
    } catch (error) {
      
      this.snackBar.open(this.translate.instant('UNEXPECTED_ERROR'), this.translate.instant('CLOSE_BTN'), {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      this.isLoading = false;
    }
  }

  onSaveSecurity(): void {
    try {
      if (!this.securityForm || !this.securityForm.valid) {
        this.snackBar.open(this.translate.instant('FILL_REQUIRED_FIELDS'), this.translate.instant('CLOSE_BTN'), {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        return;
      }
      
      this.isLoading = true;
      this.settingsService.updateSecuritySettings(this.securityForm.value).subscribe({
        next: (response) => {
          
          this.snackBar.open(this.translate.instant('SECURITY_SETTINGS_UPDATED'), this.translate.instant('CLOSE_BTN'), {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.isLoading = false;
        },
        error: (error) => {
          
          this.snackBar.open(this.translate.instant('FAILED_TO_UPDATE_SETTINGS') + `: ${error.error?.message || error.message || 'Unknown error'}`, this.translate.instant('CLOSE_BTN'), {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          this.isLoading = false;
        }
      });
    } catch (error) {
      
      this.snackBar.open(this.translate.instant('UNEXPECTED_ERROR'), this.translate.instant('CLOSE_BTN'), {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      this.isLoading = false;
    }
  }

  onSavePayment(): void {
    try {
      if (!this.paymentForm || !this.paymentForm.valid) {
        this.snackBar.open(this.translate.instant('FILL_REQUIRED_FIELDS'), this.translate.instant('CLOSE_BTN'), {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        return;
      }
      
      this.isLoading = true;
      this.settingsService.updatePaymentSettings(this.paymentForm.value).subscribe({
        next: (response) => {
          
          this.snackBar.open(this.translate.instant('PAYMENT_SETTINGS_UPDATED'), this.translate.instant('CLOSE_BTN'), {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.isLoading = false;
        },
        error: (error) => {
          
          this.snackBar.open(this.translate.instant('FAILED_TO_UPDATE_SETTINGS') + `: ${error.error?.message || error.message || 'Unknown error'}`, this.translate.instant('CLOSE_BTN'), {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          this.isLoading = false;
        }
      });
    } catch (error) {
      
      this.snackBar.open(this.translate.instant('UNEXPECTED_ERROR'), this.translate.instant('CLOSE_BTN'), {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      this.isLoading = false;
    }
  }
}