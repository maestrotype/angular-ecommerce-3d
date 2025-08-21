import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Observable, from, of, throwError } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { Settings } from './entities/settings.entity';
import { 
  UpdateSettingsDto, 
  UpdatePaymentSettingsDto, 
  UpdateGeneralSettingsDto,
  UpdateSecuritySettingsDto,
  UpdateNotificationSettingsDto 
} from './dto/update-settings.dto';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Settings)
    private settingsRepository: Repository<Settings>,
  ) {
    // Initialize default settings when service starts
    this.initializeDefaultSettings().catch(error => {
      console.error('[SettingsService] Failed to initialize default settings:', error);
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
          // Update existing setting
          Object.assign(existingSetting, updateSettingsDto);
          return await this.settingsRepository.save(existingSetting);
        } else {
          // Create new setting
          const newSetting = this.settingsRepository.create(updateSettingsDto);
          return await this.settingsRepository.save(newSetting);
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
      switchMap(updateObservable => updateObservable),
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
      switchMap(updateObservable => updateObservable),
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
      switchMap(updateObservable => updateObservable),
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
      switchMap(updateObservable => updateObservable),
      map(() => ({ success: true, message: 'Notification settings updated' })),
      catchError((error) => {
        console.error('Error updating notification settings:', error);
        return throwError(() => error);
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
  async initializeDefaultSettings(): Promise<void> {
    console.log('[SettingsService] Initializing default settings...');
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
      { key: 'payment.stripeEnabled', value: 'false', type: 'boolean', category: 'payment', description: 'Enable Stripe payments' },
      { key: 'payment.stripeTestMode', value: 'true', type: 'boolean', category: 'payment', description: 'Enable Stripe test mode' },
      { key: 'payment.stripePublishableKey', value: '', type: 'string', category: 'payment', description: 'Stripe publishable key' },
      { key: 'payment.stripeSecretKey', value: '', type: 'string', category: 'payment', description: 'Stripe secret key' },
      { key: 'payment.stripeWebhookSecret', value: '', type: 'string', category: 'payment', description: 'Stripe webhook secret' },
      { key: 'payment.liqpayEnabled', value: 'false', type: 'boolean', category: 'payment', description: 'Enable LiqPay payments' },
      { key: 'payment.liqpayTestMode', value: 'true', type: 'boolean', category: 'payment', description: 'Enable LiqPay test mode' },
      { key: 'payment.liqpayPublicKey', value: '', type: 'string', category: 'payment', description: 'LiqPay public key' },
      { key: 'payment.liqpayPrivateKey', value: '', type: 'string', category: 'payment', description: 'LiqPay private key' },
      { key: 'payment.paypalEnabled', value: 'false', type: 'boolean', category: 'payment', description: 'Enable PayPal payments' },
      { key: 'payment.paypalTestMode', value: 'true', type: 'boolean', category: 'payment', description: 'Enable PayPal test mode' },
      { key: 'payment.paypalClientId', value: '', type: 'string', category: 'payment', description: 'PayPal client ID' },
      { key: 'payment.paypalClientSecret', value: '', type: 'string', category: 'payment', description: 'PayPal client secret' },
      { key: 'payment.defaultPaymentMethod', value: 'stripe', type: 'string', category: 'payment', description: 'Default payment method' }
    ];

    let createdCount = 0;
    for (const setting of defaultSettings) {
      const existing = await this.settingsRepository.findOne({ where: { key: setting.key } });
      if (!existing) {
        await this.settingsRepository.save(setting);
        createdCount++;
        console.log(`[SettingsService] Created setting: ${setting.key}`);
      }
    }
    
    console.log(`[SettingsService] Default settings initialization complete. Created ${createdCount} new settings.`);
  }
}
