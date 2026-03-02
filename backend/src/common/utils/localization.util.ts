
import { Localizable, LocalizedString } from '../interfaces/localization.interface';

export function normalizeLocalization(value: Localizable, defaultLang: string = 'en'): LocalizedString {
    if (!value) return { [defaultLang]: '' };
    if (typeof value === 'string') {
        return { [defaultLang]: value };
    }
    return value as LocalizedString;
}

export function extractString(value: Localizable, lang: string = 'en'): string {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'object') {
        return (value as LocalizedString)[lang] || (value as LocalizedString)['en'] || Object.values(value)[0] || '';
    }
    return '';
}
