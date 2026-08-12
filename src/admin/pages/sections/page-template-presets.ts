import { CreateSectionDto } from '../../models/section.model';
import { PageTemplate } from 'src/shared/models/page.model';
import { buildSectionDtoFromPreset, getSectionPreset } from './section-presets';

export type PageTemplatePresetId = 'landing-page' | 'faq-page' | 'collection-page' | 'brand-page';

export const PAGE_TEMPLATE_PRESET_IDS: PageTemplatePresetId[] = [
  'landing-page',
  'faq-page',
  'collection-page',
  'brand-page'
];

const PAGE_TEMPLATE_BLUEPRINTS: Record<PageTemplatePresetId, string[]> = {
  'landing-page': ['hero', 'features-grid', 'testimonials', 'stats', 'newsletter'],
  'faq-page': ['hero', 'faq'],
  'collection-page': ['hero', 'categories', 'best-sellers'],
  'brand-page': ['hero', 'brands', 'special-offer']
};

export function isPageTemplatePreset(template: string): template is PageTemplatePresetId {
  return PAGE_TEMPLATE_PRESET_IDS.includes(template as PageTemplatePresetId);
}

export function buildPageTemplateSections(
  pageTarget: string,
  template: PageTemplatePresetId,
  startOrder: number
): CreateSectionDto[] {
  const types = PAGE_TEMPLATE_BLUEPRINTS[template];

  return types.map((type, index) => {
    const preset = getSectionPreset(type);
    if (!preset) {
      throw new Error(`Missing section preset for type "${type}"`);
    }
    return buildSectionDtoFromPreset(type, preset, pageTarget, startOrder + index + 1);
  });
}

export function buildMissingPageTemplateSections(
  pageTarget: string,
  template: PageTemplatePresetId,
  existingSections: Array<{ type: string; pageTarget?: string }>
): CreateSectionDto[] {
  const maxOrder = existingSections.reduce((max, section) => Math.max(max, (section as any).order || 0), 0);
  const types = PAGE_TEMPLATE_BLUEPRINTS[template].filter(type =>
    !existingSections.some(section => section.type === type && section.pageTarget === pageTarget)
  );

  return types.map((type, index) => {
    const preset = getSectionPreset(type)!;
    return buildSectionDtoFromPreset(type, preset, pageTarget, maxOrder + index + 1);
  });
}

export function getSuggestedSlugForTemplate(template: PageTemplate): string {
  switch (template) {
    case 'landing-page':
      return 'landing';
    case 'faq-page':
      return 'faq';
    case 'collection-page':
      return 'collection';
    case 'brand-page':
      return 'brands';
    default:
      return '';
  }
}
