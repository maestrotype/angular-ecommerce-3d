
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

export interface FooterSettings {
  social?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    youtube?: string;
  };
  copyright?: string;
  columns?: {
    title: string | LocalizedString;
    links: {
      label: string | LocalizedString;
      url: string;
    }[];
  }[];
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
  settings?: HeaderSettings | FooterSettings | Record<string, any>;
  model3dUrl?: string;
  show3d: boolean;
  showImage: boolean;
  pageTarget: string;
  variant: string;
  anchorId?: string;
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
  settings?: HeaderSettings | FooterSettings | Record<string, any>;
  model3dUrl?: string;
  show3d?: boolean;
  showImage?: boolean;
  pageTarget?: string;
  variant?: string;
  anchorId?: string;
}

export interface UpdateSectionDto {
  type?: string;
  title?: string | LocalizedString;
  subtitle?: string | LocalizedString;
  content?: string | LocalizedString;
  imageUrl?: string;
  isActive?: boolean;
  settings?: HeaderSettings | FooterSettings | Record<string, any>;
  model3dUrl?: string;
  show3d?: boolean;
  showImage?: boolean;
  pageTarget?: string;
  variant?: string;
  anchorId?: string;
}

export interface ReorderSectionsDto {
  sectionIds: number[];
}
