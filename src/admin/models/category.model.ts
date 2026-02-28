import { LocalizedString } from '../../shared/models/localized-string.model';

export interface Category {
  id: string;
  name: string | LocalizedString;
  slug?: string;
  icon?: string;
  description?: string | LocalizedString;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}