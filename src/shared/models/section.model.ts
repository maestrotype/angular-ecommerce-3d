import { LocalizedString } from '@shared/models/localized-string.model';

export interface Section {
  id: number;
  type: string; // 'hero', 'about', 'promo', ...
  title: string | LocalizedString;
  subtitle?: string | LocalizedString;
  content?: string | LocalizedString;
  alt?: string | LocalizedString;
  imageUrl?: string;
  order: number;
  isActive: boolean;
  settings?: any;
  model3dUrl?: string;
  show3d?: boolean;
  showImage?: boolean;
  pageTarget?: string;
  variant?: string;
  anchorId?: string;
}
