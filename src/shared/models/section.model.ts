import { Localizable } from './localization.model';

export interface Section {
  id: number;
  type: string; // 'hero', 'about', 'promo', ...
  title: Localizable;
  subtitle?: Localizable;
  content?: Localizable;
  imageUrl?: string;
  order: number;
  isActive: boolean;
  settings?: any;
  model3dUrl?: string;
  show3d?: boolean;
  showImage?: boolean;
}
