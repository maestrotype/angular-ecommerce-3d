
export interface LocalizedString {
    en?: string;
    ua?: string;
    ru?: string;
    [key: string]: string | undefined;
}

export type Localizable = string | LocalizedString | null | undefined;
