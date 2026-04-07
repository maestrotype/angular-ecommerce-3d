import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SettingsService, CloudinarySettings, Tripo3DSettings, SMTPSettings, PaymentSettings } from '../../services/settings.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-integrations',
  templateUrl: './integrations.component.html',
  styleUrls: ['./integrations.component.scss']
})
export class IntegrationsComponent implements OnInit {
  cloudinaryForm: FormGroup;
  tripoForm: FormGroup;
  smtpForm: FormGroup;
  stripeForm: FormGroup;
  isLoading = false;

  // Visibility toggles
  hideCloudinarySecret = true;
  hideTripoApiKey = true;
  hideStripeSecret = true;
  hideStripeWebhook = true;
  hideSmtpPass = true;

  constructor(
    private fb: FormBuilder,
    private settingsService: SettingsService,
    private snackBar: MatSnackBar,
    private translate: TranslateService
  ) {
    this.cloudinaryForm = this.fb.group({
      cloudName: ['', Validators.required],
      apiKey: ['', Validators.required],
      apiSecret: ['', Validators.required]
    });

    this.tripoForm = this.fb.group({
      apiKey: ['', Validators.required]
    });

    this.smtpForm = this.fb.group({
      host: ['', Validators.required],
      port: [587, [Validators.required, Validators.min(1)]],
      user: ['', Validators.required],
      pass: ['', Validators.required],
      fromEmail: ['', [Validators.required, Validators.email]]
    });

    this.stripeForm = this.fb.group({
      stripeEnabled: [false],
      stripeTestMode: [true],
      stripePublishableKey: [''],
      stripeSecretKey: [''],
      stripeWebhookSecret: ['']
    });
  }

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    this.isLoading = true;
    this.settingsService.getSettings()
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (settings) => {
          if (settings.cloudinary) {
            this.cloudinaryForm.patchValue(settings.cloudinary);
          }
          if (settings.tripo3d) {
            this.tripoForm.patchValue(settings.tripo3d);
          }
          if (settings.smtp) {
            this.smtpForm.patchValue(settings.smtp);
          }
          if (settings.payment) {
            this.stripeForm.patchValue({
              stripeEnabled: settings.payment.stripeEnabled,
              stripeTestMode: settings.payment.stripeTestMode,
              stripePublishableKey: settings.payment.stripePublishableKey,
              stripeSecretKey: settings.payment.stripeSecretKey,
              stripeWebhookSecret: settings.payment.stripeWebhookSecret
            });
          }
        },
        error: (err) => {
          this.showError('FAILED_TO_LOAD_SETTINGS');
        }
      });
  }

  onSaveCloudinary(): void {
    if (this.cloudinaryForm.invalid) return;
    this.saveSettings(this.settingsService.updateCloudinarySettings(this.cloudinaryForm.value), 'CLOUDINARY_SETTINGS_SAVED');
  }

  onSaveTripo(): void {
    if (this.tripoForm.invalid) return;
    this.saveSettings(this.settingsService.updateTripo3DSettings(this.tripoForm.value), 'TRIPO3D_SETTINGS_SAVED');
  }

  onSaveSMTP(): void {
    if (this.smtpForm.invalid) return;
    this.saveSettings(this.settingsService.updateSMTPSettings(this.smtpForm.value), 'SMTP_SETTINGS_SAVED');
  }

  onSaveStripe(): void {
    if (this.stripeForm.invalid) return;
    // We only update Stripe parts of payment settings here
    const stripeData = this.stripeForm.value;
    this.isLoading = true;
    this.settingsService.getSettings().subscribe(current => {
      const updatedPayment: PaymentSettings = {
        ...current.payment!,
        ...stripeData
      };
      this.saveSettings(this.settingsService.updatePaymentSettings(updatedPayment), 'STRIPE_SETTINGS_SAVED');
    });
  }

  private saveSettings(obs: any, successMsg: string): void {
    this.isLoading = true;
    obs.pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: () => {
          this.showSuccess(successMsg);
          this.loadSettings(); // Reload to get obscured keys
        },
        error: (err) => {
          this.showError('FAILED_TO_SAVE_SETTINGS');
        }
      });
  }

  private showSuccess(msgKey: string): void {
    this.translate.get(msgKey).subscribe(res => {
      this.snackBar.open(res, 'OK', { duration: 3000, panelClass: ['success-snackbar'] });
    });
  }

  private showError(msgKey: string): void {
    this.translate.get(msgKey).subscribe(res => {
      this.snackBar.open(res, 'OK', { duration: 5000, panelClass: ['error-snackbar'] });
    });
  }
}
