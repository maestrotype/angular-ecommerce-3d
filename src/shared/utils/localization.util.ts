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

export function getDetailedUploadErrorMessage(err: any, translate: any): string {
    const rawMsg = err?.error?.message || err?.message || '';

    if (
        rawMsg.includes('File size too large') ||
        rawMsg.includes('Maximum is 10485760') ||
        rawMsg.includes('10485760') ||
        rawMsg.includes('still larger than 10MB')
    ) {
        return translate.instant('CLOUDINARY_3D_FILE_TOO_LARGE');
    }

    return translateErrorMessage(rawMsg || 'UNKNOWN_ERROR', translate);
}
