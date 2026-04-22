import { LocalizedString } from '../models/localized-string.model';

export function getLocalizedString(value: string | LocalizedString | undefined | null, lang: string = 'en'): string {
    if (!value) return '';
    if (typeof value === 'string') return value;

    return value[lang as keyof LocalizedString] || value['en'] || Object.values(value)[0] || '';
}

export function translateErrorMessage(message: string, translate: any): string {
    if (!message) return '';
    
    // Check for "KEY.SUBKEY: Actual message" pattern
    const match = message.match(/^([A-Z0-9_]+\.[A-Z0-9_]+): (.*)$/);
    if (match) {
        const key = match[1];
        const rest = match[2];
        const translatedKey = translate.instant(key);
        
        // Attempt to translate the rest part too - it might be a known error string key
        const translatedRest = translate.instant(rest);
        
        if (translatedKey !== key) {
            return `${translatedKey}: ${translatedRest}`;
        }
    }
    
    // Try translating the whole string (maybe it's just a key)
    const translated = translate.instant(message);
    return translated;
}
