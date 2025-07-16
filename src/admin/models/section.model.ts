
export interface Section {
  id: number;
  type: 'hero' | 'about' | 'contact' | 'promo' | 'features' | 'testimonials';
  title: string;
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
  type: 'hero' | 'about' | 'contact' | 'promo' | 'features' | 'testimonials';
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
