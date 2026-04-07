import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Observable, from, of, throwError } from 'rxjs';
import { map, catchError, switchMap, tap, mergeMap, toArray } from 'rxjs/operators';
import { Settings } from './entities/settings.entity';
import { 
  UpdateSettingsDto, 
  UpdatePaymentSettingsDto, 
  UpdateGeneralSettingsDto,
  UpdateSecuritySettingsDto,
  UpdateNotificationSettingsDto,
  UpdateCloudinarySettingsDto,
  UpdateTripo3DSettingsDto,
  UpdateSMTPSettingsDto
} from './dto/update-settings.dto';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Settings)
    private settingsRepository: Repository<Settings>,
  ) {
    // Initialize default settings when service starts
    this.initializeDefaultSettings().subscribe({
      error: (error) => {
        console.error('[SettingsService] Failed to initialize default settings:', error);
      }
    });
  }

  // Get all settings
  getAllSettings(): Observable<Settings[]> {
    return from(this.settingsRepository.find());
  }

  // Get settings by category
  getSettingsByCategory(category: string): Observable<Settings[]> {
    return from(this.settingsRepository.find({ where: { category } }));
  }

  // Get single setting by key
  getSettingByKey(key: string): Observable<Settings | null> {
    return from(this.settingsRepository.findOne({ where: { key } }));
  }

  // Update single setting
  updateSetting(updateSettingsDto: UpdateSettingsDto): Observable<Settings> {
    return from(
      this.settingsRepository.findOne({ where: { key: updateSettingsDto.key } })
    ).pipe(
      switchMap(async (existingSetting) => {
        if (existingSetting) {
          // If the new value is a masked placeholder, do not overwrite the actual secret in the database.
          // This prevents the UI from accidentally corrupting credentials during a full form save.
          if (this.isMasked(updateSettingsDto.value)) {
            return existingSetting;
          }
          // Update existing setting
          Object.assign(existingSetting, updateSettingsDto);
          return await this.settingsRepository.save(existingSetting) as Settings;
        } else {
          // Create new setting
          const newSetting = this.settingsRepository.create(updateSettingsDto);
          return await this.settingsRepository.save(newSetting) as Settings;
        }
      }),
      catchError((error) => {
        console.error('Error updating setting:', error);
        return throwError(() => error);
      })
    );
  }

  // Update payment settings
  updatePaymentSettings(settings: UpdatePaymentSettingsDto): Observable<any> {
    const updates: Observable<Settings>[] = [];
    
    Object.entries(settings).forEach(([key, value]) => {
      if (value !== undefined) {
        const updateDto: UpdateSettingsDto = {
          key: `payment.${key}`,
          value: String(value),
          type: typeof value === 'boolean' ? 'boolean' : 'string',
          category: 'payment',
          description: `Payment setting: ${key}`
        };
        updates.push(this.updateSetting(updateDto));
      }
    });

    return from(updates).pipe(
      mergeMap(updateObservable => updateObservable),
      toArray(),
      map(() => ({ success: true, message: 'Payment settings updated' })),
      catchError((error) => {
        console.error('Error updating payment settings:', error);
        return throwError(() => error);
      })
    );
  }

  // Update general settings
  updateGeneralSettings(settings: UpdateGeneralSettingsDto): Observable<any> {
    const updates: Observable<Settings>[] = [];
    
    Object.entries(settings).forEach(([key, value]) => {
      if (value !== undefined) {
        const updateDto: UpdateSettingsDto = {
          key: `general.${key}`,
          value: String(value),
          type: 'string',
          category: 'general',
          description: `General setting: ${key}`
        };
        updates.push(this.updateSetting(updateDto));
      }
    });

    return from(updates).pipe(
      mergeMap(updateObservable => updateObservable),
      toArray(),
      map(() => ({ success: true, message: 'General settings updated' })),
      catchError((error) => {
        console.error('Error updating general settings:', error);
        return throwError(() => error);
      })
    );
  }

  // Update security settings
  updateSecuritySettings(settings: UpdateSecuritySettingsDto): Observable<any> {
    const updates: Observable<Settings>[] = [];
    
    Object.entries(settings).forEach(([key, value]) => {
      if (value !== undefined) {
        const updateDto: UpdateSettingsDto = {
          key: `security.${key}`,
          value: String(value),
          type: typeof value === 'boolean' ? 'boolean' : 'number',
          category: 'security',
          description: `Security setting: ${key}`
        };
        updates.push(this.updateSetting(updateDto));
      }
    });

    return from(updates).pipe(
      mergeMap(updateObservable => updateObservable),
      toArray(),
      map(() => ({ success: true, message: 'Security settings updated' })),
      catchError((error) => {
        console.error('Error updating security settings:', error);
        return throwError(() => error);
      })
    );
  }

  // Update notification settings
  updateNotificationSettings(settings: UpdateNotificationSettingsDto): Observable<any> {
    const updates: Observable<Settings>[] = [];
    
    Object.entries(settings).forEach(([key, value]) => {
      if (value !== undefined) {
        const updateDto: UpdateSettingsDto = {
          key: `notifications.${key}`,
          value: String(value),
          type: 'boolean',
          category: 'notifications',
          description: `Notification setting: ${key}`
        };
        updates.push(this.updateSetting(updateDto));
      }
    });

    return from(updates).pipe(
      mergeMap(updateObservable => updateObservable),
      toArray(),
      map(() => ({ success: true, message: 'Notification settings updated' })),
      catchError((error) => {
        console.error('Error updating notification settings:', error);
        return throwError(() => error);
      })
    );
  }

  // Update Cloudinary settings
  updateCloudinarySettings(settings: UpdateCloudinarySettingsDto): Observable<any> {
    const updates: Observable<Settings>[] = [];
    
    Object.entries(settings).forEach(([key, value]) => {
      if (value !== undefined) {
        const updateDto: UpdateSettingsDto = {
          key: `cloudinary.${key}`,
          value: String(value),
          type: 'string',
          category: 'cloudinary',
          description: `Cloudinary setting: ${key}`
        };
        updates.push(this.updateSetting(updateDto));
      }
    });

    return from(updates).pipe(
      mergeMap(updateObservable => updateObservable),
      toArray(),
      map(() => ({ success: true, message: 'Cloudinary settings updated' })),
      catchError((error) => {
        console.error('Error updating cloudinary settings:', error);
        return throwError(() => error);
      })
    );
  }

  // Update Tripo3D settings
  updateTripo3DSettings(settings: UpdateTripo3DSettingsDto): Observable<any> {
    const updates: Observable<Settings>[] = [];
    
    Object.entries(settings).forEach(([key, value]) => {
      if (value !== undefined) {
        const updateDto: UpdateSettingsDto = {
          key: `tripo3d.${key}`,
          value: String(value),
          type: 'string',
          category: 'tripo3d',
          description: `Tripo3D setting: ${key}`
        };
        updates.push(this.updateSetting(updateDto));
      }
    });

    return from(updates).pipe(
      mergeMap(updateObservable => updateObservable),
      toArray(),
      map(() => ({ success: true, message: 'Tripo3D settings updated' })),
      catchError((error) => {
        console.error('Error updating tripo3d settings:', error);
        return throwError(() => error);
      })
    );
  }

  // Update SMTP settings
  updateSMTPSettings(settings: UpdateSMTPSettingsDto): Observable<any> {
    const updates: Observable<Settings>[] = [];
    
    Object.entries(settings).forEach(([key, value]) => {
      if (value !== undefined) {
        const updateDto: UpdateSettingsDto = {
          key: `smtp.${key}`,
          value: String(value),
          type: typeof value === 'number' ? 'number' : 'string',
          category: 'smtp',
          description: `SMTP setting: ${key}`
        };
        updates.push(this.updateSetting(updateDto));
      }
    });

    return from(updates).pipe(
      mergeMap(updateObservable => updateObservable),
      toArray(),
      map(() => ({ success: true, message: 'SMTP settings updated' })),
      catchError((error) => {
        console.error('Error updating SMTP settings:', error);
        return throwError(() => error);
      })
    );
  }

  // Get all settings as grouped object with masked secrets
  getSettingsGroupedSecure(): Observable<any> {
    return this.getSettingsGrouped().pipe(
      map((grouped) => {
        const secure = JSON.parse(JSON.stringify(grouped));
        
        // Mask specific sensitive keys
        const sensitiveKeys = [
          { cat: 'payment', key: 'stripeSecretKey' },
          { cat: 'payment', key: 'stripeWebhookSecret' },
          { cat: 'payment', key: 'liqpayPrivateKey' },
          { cat: 'payment', key: 'paypalClientSecret' },
          { cat: 'cloudinary', key: 'apiSecret' },
          { cat: 'tripo3d', key: 'apiKey' },
          { cat: 'smtp', key: 'pass' }
        ];

        sensitiveKeys.forEach(({ cat, key }) => {
          if (secure[cat] && secure[cat][key]) {
            const val = String(secure[cat][key]);
            if (val.length > 8) {
              secure[cat][key] = val.slice(0, 4) + '****' + val.slice(-4);
            } else {
              secure[cat][key] = '********';
            }
          }
        });

        return secure;
      })
    );
  }

  // Get all settings as grouped object
  getSettingsGrouped(): Observable<any> {
    return from(this.settingsRepository.find()).pipe(
      map((settings) => {
        const grouped: any = {};
        
        settings.forEach((setting) => {
          const [category, key] = setting.key.split('.');
          if (!grouped[category]) {
            grouped[category] = {};
          }
          
          // Convert value based on type
          let value: any = setting.value;
          if (setting.type === 'boolean') {
            value = value === 'true';
          } else if (setting.type === 'number') {
            value = parseFloat(value);
          } else if (setting.type === 'json') {
            try {
              value = JSON.parse(value);
            } catch {
              value = setting.value;
            }
          }
          
          grouped[category][key] = value;
        });
        
        return grouped;
      }),
      catchError((error) => {
        console.error('Error getting grouped settings:', error);
        return of({});
      })
    );
  }

  // Initialize default settings
  initializeDefaultSettings(): Observable<void> {
    console.log('[SettingsService] Initializing default settings...');
    
    // Get Stripe keys from environment variables
    const stripePublishableKey = process.env.STRIPE_PUBLISHABLE_KEY || '';
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
    const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
    
    console.log('[SettingsService] Stripe keys from env:', { 
      publishableKey: stripePublishableKey ? '***' + stripePublishableKey.slice(-4) : 'NOT SET',
      secretKey: stripeSecretKey ? '***' + stripeSecretKey.slice(-4) : 'NOT SET',
      webhookSecret: stripeWebhookSecret ? '***' + stripeWebhookSecret.slice(-4) : 'NOT SET'
    });
    
    const defaultSettings = [
      // General settings
      { key: 'general.siteName', value: 'E-Commerce Admin', type: 'string', category: 'general', description: 'Site name' },
      { key: 'general.siteDescription', value: 'Admin panel for e-commerce management', type: 'string', category: 'general', description: 'Site description' },
      { key: 'general.currency', value: 'USD', type: 'string', category: 'general', description: 'Default currency' },
      { key: 'general.timezone', value: 'UTC', type: 'string', category: 'general', description: 'Default timezone' },
      { key: 'general.language', value: 'en', type: 'string', category: 'general', description: 'Default language' },
      
      // Security settings
      { key: 'security.twoFactorAuth', value: 'false', type: 'boolean', category: 'security', description: 'Enable two-factor authentication' },
      { key: 'security.sessionTimeout', value: '30', type: 'number', category: 'security', description: 'Session timeout in minutes' },
      { key: 'security.passwordExpiry', value: '90', type: 'number', category: 'security', description: 'Password expiry in days' },
      { key: 'security.maxLoginAttempts', value: '5', type: 'number', category: 'security', description: 'Maximum login attempts' },
      
      // Notification settings
      { key: 'notifications.emailNotifications', value: 'true', type: 'boolean', category: 'notifications', description: 'Enable email notifications' },
      { key: 'notifications.orderNotifications', value: 'true', type: 'boolean', category: 'notifications', description: 'Enable order notifications' },
      { key: 'notifications.stockAlerts', value: 'true', type: 'boolean', category: 'notifications', description: 'Enable stock alerts' },
      { key: 'notifications.userRegistrations', value: 'true', type: 'boolean', category: 'notifications', description: 'Enable user registration notifications' },
      { key: 'notifications.systemUpdates', value: 'false', type: 'boolean', category: 'notifications', description: 'Enable system update notifications' },
      
      // Payment settings
      { key: 'payment.stripeEnabled', value: stripePublishableKey ? 'true' : 'false', type: 'boolean', category: 'payment', description: 'Enable Stripe payments' },
      { key: 'payment.stripeTestMode', value: 'true', type: 'boolean', category: 'payment', description: 'Enable Stripe test mode' },
      { key: 'payment.stripePublishableKey', value: stripePublishableKey, type: 'string', category: 'payment', description: 'Stripe publishable key' },
      { key: 'payment.stripeSecretKey', value: stripeSecretKey, type: 'string', category: 'payment', description: 'Stripe secret key' },
      { key: 'payment.stripeWebhookSecret', value: stripeWebhookSecret, type: 'string', category: 'payment', description: 'Stripe webhook secret' },
      { key: 'payment.liqpayEnabled', value: 'false', type: 'boolean', category: 'payment', description: 'Enable LiqPay payments' },
      { key: 'payment.liqpayTestMode', value: 'true', type: 'boolean', category: 'payment', description: 'Enable LiqPay test mode' },
      { key: 'payment.liqpayPublicKey', value: '', type: 'string', category: 'payment', description: 'LiqPay public key' },
      { key: 'payment.liqpayPrivateKey', value: '', type: 'string', category: 'payment', description: 'LiqPay private key' },
      { key: 'payment.paypalEnabled', value: 'false', type: 'boolean', category: 'payment', description: 'Enable PayPal payments' },
      { key: 'payment.paypalTestMode', value: 'true', type: 'boolean', category: 'payment', description: 'Enable PayPal test mode' },
      { key: 'payment.paypalClientId', value: '', type: 'string', category: 'payment', description: 'PayPal client ID' },
      { key: 'payment.paypalClientSecret', value: '', type: 'string', category: 'payment', description: 'PayPal client secret' },
      { key: 'payment.defaultPaymentMethod', value: 'stripe', type: 'string', category: 'payment', description: 'Default payment method' },
      
      // Cloudinary settings
      { key: 'cloudinary.cloudName', value: process.env.CLOUDINARY_CLOUD_NAME || '', type: 'string', category: 'cloudinary', description: 'Cloudinary cloud name' },
      { key: 'cloudinary.apiKey', value: process.env.CLOUDINARY_API_KEY || '', type: 'string', category: 'cloudinary', description: 'Cloudinary API key' },
      { key: 'cloudinary.apiSecret', value: process.env.CLOUDINARY_API_SECRET || '', type: 'string', category: 'cloudinary', description: 'Cloudinary API secret' },
      
      // Tripo3D settings
      { key: 'tripo3d.apiKey', value: '', type: 'string', category: 'tripo3d', description: 'Tripo3D API key' },
      
      // SMTP settings
      { key: 'smtp.host', value: process.env.SMTP_HOST || '', type: 'string', category: 'smtp', description: 'SMTP host' },
      { key: 'smtp.port', value: process.env.SMTP_PORT || '587', type: 'number', category: 'smtp', description: 'SMTP port' },
      { key: 'smtp.user', value: process.env.SMTP_USER || '', type: 'string', category: 'smtp', description: 'SMTP username' },
      { key: 'smtp.pass', value: process.env.SMTP_PASS || '', type: 'string', category: 'smtp', description: 'SMTP password' },
      { key: 'smtp.fromEmail', value: process.env.SMTP_FROM || '', type: 'string', category: 'smtp', description: 'SMTP from email' }
    ];

    // Process each setting and collect results
    const settingObservables = defaultSettings.map(setting => 
      from(this.settingsRepository.findOne({ where: { key: setting.key } })).pipe(
        switchMap(existing => {
          if (!existing) {
            return from(this.settingsRepository.save(setting)).pipe(
              tap(() => console.log(`[SettingsService] Created setting: ${setting.key}`)),
              map(() => true)
            );
          }
          return of(false);
        })
      )
    );

    return from(settingObservables).pipe(
      mergeMap(observable => observable),
      toArray(),
      map(results => {
        const createdCount = results.filter(result => result).length;
        console.log(`[SettingsService] Default settings initialization complete. Created ${createdCount} new settings.`);
        return void 0;
      }),
      catchError(error => {
        console.error('[SettingsService] Initialize default settings error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Checks if a string value is a masked placeholder (e.g., "abcd****wxyz" or "********").
   * Masked values should not be saved back to the database as they are just UI representations.
   */
  private isMasked(value: string): boolean {
    if (!value) return false;
    const str = String(value);
    // Matches the pattern used in getSettingsGroupedSecure: 4 chars + **** + 4 chars
    // OR the fallback 8-star mask
    return str.includes('****') || str === '********';
  }
}
