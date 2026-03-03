import { LocalizedString } from '../models/localized-string.model';

export function getLocalizedString(value: string | LocalizedString | undefined | null, lang: string = 'en'): string {
    if (!value) return '';
    if (typeof value === 'string') return value;

    return value[lang as keyof LocalizedString] || value['en'] || Object.values(value)[0] || '';
}
