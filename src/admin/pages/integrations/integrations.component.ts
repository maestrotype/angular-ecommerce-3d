import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SettingsService, CloudinarySettings, CloudinaryStatus, AiGenerationSettings, SMTPSettings, PaymentSettings } from '../../services/settings.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { ApiEnvironmentService } from '../../../app/core/services/api-environment.service';
import { resolveApiError, formatResolvedApiError } from '../../../shared/utils/localization.util';

@Component({
  selector: 'app-integrations',
  templateUrl: './integrations.component.html',
  styleUrls: ['./integrations.component.scss']
})
export class IntegrationsComponent implements OnInit {
  cloudinaryForm: FormGroup;
  aiForm: FormGroup;
  smtpForm: FormGroup;
  stripeForm: FormGroup;
  isLoading = false;
  isCheckingCloudinary = false;
  productionCloudinaryStatus: CloudinaryStatus | null = null;
  localCloudinaryStatus: CloudinaryStatus | null = null;

  // Visibility toggles
  hideCloudinarySecret = true;
  hideTripoApiKey = true;
  hideMeshyApiKey = true;
  hideHunyuanApiKey = true;
  hideLumaApiKey = true;
  hideStripeSecret = true;
  hideStripeWebhook = true;
  hideSmtpPass = true;

  constructor(
    private fb: FormBuilder,
    private settingsService: SettingsService,
    private snackBar: MatSnackBar,
    private translate: TranslateService,
    private apiEnvironment: ApiEnvironmentService,
  ) {
    this.cloudinaryForm = this.fb.group({
      cloudName: ['', Validators.required],
      apiKey: ['', Validators.required],
      apiSecret: ['', Validators.required]
    });

    this.aiForm = this.fb.group({
      activeProvider: ['tripo3d', Validators.required],
      tripoApiKey: [''],
      meshyApiKey: [''],
      hunyuanApiKey: [''],
      lumaApiKey: [''],
      customUrl: [''],
      customUseHq: [false]
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

  get isLocalApi(): boolean {
    return this.apiEnvironment.isLocalApi;
  }

  ngOnInit(): void {
    this.loadSettings();
    this.refreshCloudinaryStatus();
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
          if (settings.ai) {
            const brokenLocal = ['unique3d', 'hunyuan_v2'];
            if (brokenLocal.includes(settings.ai.activeProvider)) {
              settings.ai.activeProvider = 'tripo3d';
            }
            this.aiForm.patchValue(settings.ai);
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
        error: () => {
          this.showError('FAILED_TO_LOAD_SETTINGS');
        }
      });
  }

  refreshCloudinaryStatus(): void {
    this.isCheckingCloudinary = true;
    this.settingsService.getProductionCloudinaryStatus()
      .pipe(finalize(() => this.isCheckingCloudinary = false))
      .subscribe((status) => {
        this.productionCloudinaryStatus = status;
      });

    if (this.isLocalApi) {
      this.settingsService.getCloudinaryStatus().subscribe((status) => {
        this.localCloudinaryStatus = status;
      });
    } else {
      this.localCloudinaryStatus = null;
    }
  }

  getCloudinaryStatusMessage(status: CloudinaryStatus | null): string {
    if (!status) return '';
    const params = status.messageParams || {};
    return this.translate.instant(status.messageKey, params);
  }

  onSaveCloudinary(): void {
    if (this.cloudinaryForm.invalid) return;

    const value = this.cloudinaryForm.value as CloudinarySettings;
    if (value.cloudName?.trim().toLowerCase() === 'cloudinary') {
      this.snackBar.open(
        this.translate.instant('CLOUDINARY_WRONG_CLOUD_NAME'),
        this.translate.instant('CLOSE_BTN'),
        { duration: 12000, panelClass: ['error-snackbar'] },
      );
      return;
    }

    this.isLoading = true;
    this.settingsService.updateCloudinarySettingsOnProduction(value)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response) => {
          const status = response.cloudinaryStatus;
          if (status) {
            this.productionCloudinaryStatus = status;
            this.showCloudinaryStatusNotification(status, 'CLOUDINARY_SETTINGS_SAVED');
          } else {
            this.showSuccess('CLOUDINARY_SETTINGS_SAVED');
          }
          this.refreshCloudinaryStatus();
          this.loadSettings();
        },
        error: (err) => {
          const resolved = resolveApiError(err, this.translate, {
            titleKey: 'CLOUDINARY_SAVE_FAILED',
            targetsProductionApi: true,
          });
          this.snackBar.open(formatResolvedApiError(resolved), this.translate.instant('CLOSE_BTN'), {
            duration: resolved.duration,
            panelClass: resolved.panelClass,
          });
        },
      });
  }

  onSaveAi(): void {
    if (this.aiForm.invalid) return;
    
    const rawValue = this.aiForm.value;
    const cleanData: any = {};
    
    Object.keys(rawValue).forEach(key => {
      const val = rawValue[key];
      if (key === 'customUseHq') {
        cleanData[key] = !!val;
      } else {
        cleanData[key] = val !== null && val !== undefined ? String(val) : '';
      }
    });

    this.saveSettings(this.settingsService.updateAiSettings(cleanData), 'AI_SETTINGS_SAVED');
  }

  onSaveSMTP(): void {
    if (this.smtpForm.invalid) return;
    this.saveSettings(this.settingsService.updateSMTPSettings(this.smtpForm.value), 'SMTP_SETTINGS_SAVED');
  }

  onSaveStripe(): void {
    if (this.stripeForm.invalid) return;
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
          this.loadSettings();
        },
        error: () => {
          this.showError('FAILED_TO_SAVE_SETTINGS');
        }
      });
  }

  private showCloudinaryStatusNotification(status: CloudinaryStatus, titleKey: string): void {
    const title = this.translate.instant(titleKey);
    const detail = this.getCloudinaryStatusMessage(status);
    const panelClass = status.uploadReady ? ['success-snackbar'] : ['warning-snackbar'];
    this.snackBar.open(`${title}\n${detail}`, this.translate.instant('CLOSE_BTN'), {
      duration: status.uploadReady ? 8000 : 18000,
      panelClass,
    });
  }

  private showSuccess(msgKey: string): void {
    this.translate.get(msgKey).subscribe(res => {
      this.snackBar.open(res, this.translate.instant('CLOSE_BTN'), { duration: 3000, panelClass: ['success-snackbar'] });
    });
  }

  private showError(msgKey: string): void {
    this.translate.get(msgKey).subscribe(res => {
      this.snackBar.open(res, this.translate.instant('CLOSE_BTN'), { duration: 5000, panelClass: ['error-snackbar'] });
    });
  }
}
