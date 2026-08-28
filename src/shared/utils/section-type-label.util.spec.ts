import { resolveSectionTypeLabel, sectionTypeLabelKey } from './section-type-label.util';

describe('section type labels', () => {
  it('builds nested i18n keys from kebab-case types', () => {
    expect(sectionTypeLabelKey('product-carousel')).toBe('SECTION_TYPE_LABELS.PRODUCT_CAROUSEL');
    expect(sectionTypeLabelKey('about')).toBe('SECTION_TYPE_LABELS.ABOUT');
  });

  it('returns the translated label when ngx-translate resolves a string', () => {
    const translate = {
      instant: (key: string) =>
        key === 'SECTION_TYPE_LABELS.PRODUCT_CAROUSEL' ? 'Product Carousel' : key,
    };

    expect(resolveSectionTypeLabel('product-carousel', translate)).toBe('Product Carousel');
  });

  it('does not show a raw key when the translation is missing or an object', () => {
    const missing = { instant: (key: string) => key };
    const asObject = { instant: () => ({ TITLE: 'New This Season' }) };

    expect(resolveSectionTypeLabel('product-carousel', missing)).toBe('product carousel');
    expect(resolveSectionTypeLabel('product-carousel', asObject)).toBe('product carousel');
  });
});
