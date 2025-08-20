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
      this.loadSettings();
      
      const savedLang = localStorage.getItem('adminLang') || 'en';
      this.translate.setDefaultLang(savedLang);
      this.translate.use(savedLang);
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
  }

  loadSettings(): void {
    this.settingsService.getSettings().subscribe({
      next: (settings) => {
        try {
          if (settings.general) {
            this.generalForm.patchValue(settings.general);
          }
          if (settings.notifications) {
            this.notificationForm.patchValue(settings.notifications);
          }
          if (settings.security) {
            this.securityForm.patchValue(settings.security);
          }
          if (settings.payment) {
            this.paymentForm.patchValue(settings.payment);
          }
          
          // Set language after forms are initialized
          const savedLang = localStorage.getItem('adminLang') || 'en';
          if (this.generalForm && this.generalForm.get('language')) {
            this.generalForm.get('language')?.setValue(savedLang);
          }
        } catch (error) {
          console.error('Error patching form values:', error);
        }
      },
      error: (error) => {
        console.error('Failed to load settings:', error);
      }
    });
  }

  onSaveGeneral(): void {
    try {
      if (!this.generalForm) {
        console.error('General form not initialized');
        return;
      }
      
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
    } catch (error) {
      console.error('Error saving general settings:', error);
      this.isLoading = false;
    }
  }

  onSaveNotifications(): void {
    try {
      if (!this.notificationForm) {
        console.error('Notification form not initialized');
        return;
      }
      
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
    } catch (error) {
      console.error('Error saving notification settings:', error);
      this.isLoading = false;
    }
  }

  onSaveSecurity(): void {
    try {
      if (!this.securityForm) {
        console.error('Security form not initialized');
        return;
      }
      
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
    } catch (error) {
      console.error('Error saving security settings:', error);
      this.isLoading = false;
    }
  }

  onSavePayment(): void {
    try {
      if (!this.paymentForm) {
        console.error('Payment form not initialized');
        return;
      }
      
      if (this.paymentForm.valid) {
        this.isLoading = true;
        this.settingsService.updatePaymentSettings(this.paymentForm.value).subscribe({
          next: () => {
            this.snackBar.open('Payment settings updated successfully', 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.isLoading = false;
          },
          error: (error) => {
            this.snackBar.open('Failed to update payment settings', 'Close', {
              duration: 3000,
              panelClass: ['error-snackbar']
            });
            this.isLoading = false;
          }
        });
      }
    } catch (error) {
      console.error('Error saving payment settings:', error);
      this.isLoading = false;
    }
  }
}