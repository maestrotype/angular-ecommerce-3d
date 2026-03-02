import { Localizable } from './localization.model';

export interface Category {
    id: string;
    name: Localizable;
    slug?: string;
    icon?: string;
    description?: Localizable;
    isActive?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}