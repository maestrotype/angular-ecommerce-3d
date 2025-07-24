
export interface Section {
  id: number;
  type: 'hero' | 'best-sellers' | 'categories' | 'special-offer' | 'brands' | 'contacts' | 'about';
  title: string;
  subtitle: string;
  content?: string;
  imageUrl?: string;
  order: number;
  isActive: boolean;
  settings?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  model3dUrl?: string;
  show3d?: boolean;
  showImage?: boolean;
}
export interface CreateSectionDto {
  type: 'hero' | 'best-sellers' | 'categories' | 'special-offer' | 'brands' | 'contacts' | 'about';
  title: string;
  content?: string;
  imageUrl?: string;
  order?: number;
  isActive?: boolean;
  settings?: Record<string, any>;
}

export interface UpdateSectionDto extends Partial<CreateSectionDto> { }

export interface ReorderSectionsDto {
  sectionIds: number[];
}
