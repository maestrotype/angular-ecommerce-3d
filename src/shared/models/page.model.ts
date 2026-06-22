import { LocalizedString } from './localized-string.model';

export type PageTemplate = 'simple' | 'sections' | 'contact';
export type PageStatus = 'draft' | 'published';

export interface Page {
  id: number;
  slug: string;
  title: string | LocalizedString;
  content?: string | LocalizedString;
  seoDescription?: string | LocalizedString;
  template: PageTemplate;
  status: PageStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePageDto {
  slug: string;
  title: LocalizedString;
  content?: LocalizedString;
  seoDescription?: LocalizedString;
  template?: PageTemplate;
  status?: PageStatus;
}

export interface UpdatePageDto extends Partial<CreatePageDto> {}
