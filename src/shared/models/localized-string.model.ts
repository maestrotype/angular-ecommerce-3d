export interface LocalizedString {
    en: string;
    ru?: string;
    ua?: string;
    [key: string]: string | undefined;
}
