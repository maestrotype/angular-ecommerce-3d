
import { LocalizedString } from '../../shared/models/localized-string.model';

export interface MenuItem {
  title: string | LocalizedString;
  url: string;
  access: 'all' | 'admin' | 'closed';
  isActive: boolean;
}

export interface CategoryItem {
  name: string;
  slug: string;
  icon: string;
  isActive: boolean;
}

export interface BrandItem {
  id?: number;
  name: string | LocalizedString;
  logo: string;
  isActive?: boolean;
}

export interface HeaderSettings {
  logoUrl?: string;
  showSearch?: boolean;
  showCart?: boolean;
  showProfile?: boolean;
  menu?: MenuItem[];
  categories?: CategoryItem[];
  brands?: BrandItem[];
  selectedCategories?: number[];
}

export interface Section {
  id: number;
  type: string;
  title: string | LocalizedString;
  subtitle: string | LocalizedString;
  content?: string | LocalizedString;
  imageUrl?: string;
  order: number;
  isActive: boolean;
  settings?: HeaderSettings | Record<string, any>;
  model3dUrl?: string;
  show3d: boolean;
  showImage: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSectionDto {
  type: string;
  title: string | LocalizedString;
  subtitle?: string | LocalizedString;
  content?: string | LocalizedString;
  imageUrl?: string;
  isActive?: boolean;
  settings?: HeaderSettings | Record<string, any>;
  model3dUrl?: string;
  show3d?: boolean;
  showImage?: boolean;
}

export interface UpdateSectionDto {
  type?: string;
  title?: string | LocalizedString;
  subtitle?: string | LocalizedString;
  content?: string | LocalizedString;
  imageUrl?: string;
  isActive?: boolean;
  settings?: HeaderSettings | Record<string, any>;
  model3dUrl?: string;
  show3d?: boolean;
  showImage?: boolean;
}

export interface ReorderSectionsDto {
  sectionIds: number[];
}
