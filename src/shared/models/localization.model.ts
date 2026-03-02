
export interface LocalizedString {
    en?: string;
    ua?: string;
    ru?: string;
    [key: string]: string | undefined;
}

export type Localizable = string | LocalizedString | null | undefined;

export function extractString(value: Localizable, lang: string = 'en'): string {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'object') {
        return value[lang] || value['en'] || Object.values(value)[0] || '';
    }
    return '';
}
