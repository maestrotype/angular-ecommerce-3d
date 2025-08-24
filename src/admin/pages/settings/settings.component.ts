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
      
      const savedLang = localStorage.getItem('adminLang') || 'en';
      this.translate.setDefaultLang(savedLang);
      this.translate.use(savedLang);
      
      // Load settings after forms are initialized
      this.loadSettings();
    } catch (error) {
      console.error('Failed to initialize settings component:', error);
    }
  }

  private initializeForms(): void {
    try {
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

      console.log('Settings forms initialized successfully');
    } catch (error) {
      console.error('Failed to initialize settings forms:', error);
      // Create minimal forms as fallback
      this.generalForm = this.fb.group({});
      this.notificationForm = this.fb.group({});
      this.securityForm = this.fb.group({});
      this.paymentForm = this.fb.group({});
    }
  }

  onLanguageChange(lang: string) {
    this.translate.use(lang);
    localStorage.setItem('adminLang', lang);
    
    // Update form value if form exists
    if (this.generalForm && this.generalForm.get('language')) {
      this.generalForm.get('language')?.setValue(lang);
    }
  }

  loadSettings(): void {
    this.isLoading = true;
    this.settingsService.getSettings().subscribe({
      next: (settings) => {
        try {
          console.log('[SettingsComponent] Loaded settings:', settings);
          
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
          console.error('Error patching form values:', error);
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('Failed to load settings:', error);
        this.isLoading = false;
      }
    });
  }

  onSaveGeneral(): void {
    try {
      if (!this.generalForm || !this.generalForm.valid) {
        this.snackBar.open('Please fill in all required fields', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        return;
      }
      
      this.isLoading = true;
      this.settingsService.updateGeneralSettings(this.generalForm.value).subscribe({
        next: (response) => {
          console.log('[SettingsComponent] General settings updated:', response);
          this.snackBar.open('General settings updated successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Failed to update general settings:', error);
          this.snackBar.open(`Failed to update general settings: ${error.error?.message || error.message || 'Unknown error'}`, 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          this.isLoading = false;
        }
      });
    } catch (error) {
      console.error('Error saving general settings:', error);
      this.snackBar.open('Unexpected error occurred', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      this.isLoading = false;
    }
  }

  onSaveNotifications(): void {
    try {
      if (!this.notificationForm) {
        this.snackBar.open('Notification form not initialized', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        return;
      }
      
      this.isLoading = true;
      this.settingsService.updateNotificationSettings(this.notificationForm.value).subscribe({
        next: (response) => {
          console.log('[SettingsComponent] Notification settings updated:', response);
          this.snackBar.open('Notification settings updated successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Failed to update notification settings:', error);
          this.snackBar.open(`Failed to update notification settings: ${error.error?.message || error.message || 'Unknown error'}`, 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          this.isLoading = false;
        }
      });
    } catch (error) {
      console.error('Error saving notification settings:', error);
      this.snackBar.open('Unexpected error occurred', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      this.isLoading = false;
    }
  }

  onSaveSecurity(): void {
    try {
      if (!this.securityForm || !this.securityForm.valid) {
        this.snackBar.open('Please fill in all required fields', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        return;
      }
      
      this.isLoading = true;
      this.settingsService.updateSecuritySettings(this.securityForm.value).subscribe({
        next: (response) => {
          console.log('[SettingsComponent] Security settings updated:', response);
          this.snackBar.open('Security settings updated successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Failed to update security settings:', error);
          this.snackBar.open(`Failed to update security settings: ${error.error?.message || error.message || 'Unknown error'}`, 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          this.isLoading = false;
        }
      });
    } catch (error) {
      console.error('Error saving security settings:', error);
      this.snackBar.open('Unexpected error occurred', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      this.isLoading = false;
    }
  }

  onSavePayment(): void {
    try {
      if (!this.paymentForm || !this.paymentForm.valid) {
        this.snackBar.open('Please fill in all required fields', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        return;
      }
      
      this.isLoading = true;
      this.settingsService.updatePaymentSettings(this.paymentForm.value).subscribe({
        next: (response) => {
          console.log('[SettingsComponent] Payment settings updated:', response);
          this.snackBar.open('Payment settings updated successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Failed to update payment settings:', error);
          this.snackBar.open(`Failed to update payment settings: ${error.error?.message || error.message || 'Unknown error'}`, 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          this.isLoading = false;
        }
      });
    } catch (error) {
      console.error('Error saving payment settings:', error);
      this.snackBar.open('Unexpected error occurred', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      this.isLoading = false;
    }
  }
}