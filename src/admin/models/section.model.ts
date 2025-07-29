
export interface MenuItem {
  title: string;
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

export interface HeaderSettings {
  logoUrl?: string;
  showSearch?: boolean;
  showCart?: boolean;
  showProfile?: boolean;
  menu?: MenuItem[];
  categories?: CategoryItem[];
  selectedCategories?: number[];
}

export interface Section {
  id: number;
  type: string;
  title: string;
  subtitle: string;
  content?: string;
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
  title: string;
  subtitle?: string;
  content?: string;
  imageUrl?: string;
  isActive?: boolean;
  settings?: HeaderSettings | Record<string, any>;
  model3dUrl?: string;
  show3d?: boolean;
  showImage?: boolean;
}

export interface UpdateSectionDto {
  type?: string;
  title?: string;
  subtitle?: string;
  content?: string;
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
