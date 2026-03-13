import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LocalizedString } from '@shared/models/localized-string.model';

@Pipe({
    name: 'localized',
    standalone: true,
    pure: false
})
export class LocalizedPipe implements PipeTransform {
    constructor(private translate: TranslateService) { }

    transform(value: any): string {
        if (!value) return '';

        // If it's a simple string, return it as is (legacy support)
        if (typeof value === 'string') {
            return value;
        }

        // If it's a localized object
        const currentLang = this.translate.currentLang || this.translate.getDefaultLang() || 'en';

        // 1. Try exact match for current language
        if (value[currentLang]) {
            return value[currentLang];
        }

        // 2. Fallback to English
        if (value['en']) {
            return value['en'];
        }

        // 3. Fallback to first available key
        const keys = Object.keys(value);
        if (keys.length > 0) {
            // Find the first key that has a string value
            const firstAvailableKey = keys.find(k => typeof value[k] === 'string');
            return firstAvailableKey ? value[firstAvailableKey] : '';
        }

        return '';
    }
}
