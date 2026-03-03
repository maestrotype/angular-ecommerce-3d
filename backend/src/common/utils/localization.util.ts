
export function extractString(value: any, lang: string = 'en'): string {
    if (!value) return '';
    if (typeof value === 'string') return value;

    // If it's a localized object, try the requested language
    if (value && typeof value === 'object') {
        return value[lang] || value['en'] || Object.values(value)[0] || '';
    }

    return String(value);
}

export function generateSlug(name: any): string {
    const baseString = extractString(name, 'en');
    return baseString
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
}
