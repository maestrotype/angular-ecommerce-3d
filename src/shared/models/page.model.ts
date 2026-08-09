import { LocalizedString } from './localized-string.model';

export type PageTemplate =
  | 'simple'
  | 'sections'
  | 'contact'
  | 'landing-page'
  | 'faq-page'
  | 'collection-page'
  | 'brand-page';
export type PageStatus = 'draft' | 'published';

export const SECTION_BASED_PAGE_TEMPLATES: PageTemplate[] = [
  'sections',
  'landing-page',
  'faq-page',
  'collection-page',
  'brand-page'
];

export function isSectionBasedPageTemplate(template: PageTemplate | string): boolean {
  return SECTION_BASED_PAGE_TEMPLATES.includes(template as PageTemplate);
}

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
