import { Section } from '../../../shared/models/section.model';
import { buildStorefrontPreviewSections } from './storefront-preview-sections.util';

function section(partial: Partial<Section> & Pick<Section, 'id' | 'type'>): Section {
  return {
    title: '',
    order: 0,
    isActive: true,
    pageTarget: 'home',
    ...partial,
  };
}

describe('buildStorefrontPreviewSections', () => {
  it('uses a home-page header as chrome when no global header exists', () => {
    const sections = [
      section({ id: 1, type: 'header', order: 1, pageTarget: 'home', title: 'HEADER SECTION' }),
      section({ id: 2, type: 'video-hero', order: 2, pageTarget: 'home' }),
      section({ id: 3, type: 'hero', order: 3, pageTarget: 'home' }),
    ];

    expect(buildStorefrontPreviewSections(sections, 'home').map(item => item.id)).toEqual([1, 2, 3]);
  });

  it('prefers a global header and does not duplicate a page-targeted header in the body', () => {
    const sections = [
      section({ id: 10, type: 'header', order: 1, pageTarget: 'global' }),
      section({ id: 11, type: 'header', order: 2, pageTarget: 'home' }),
      section({ id: 12, type: 'hero', order: 3, pageTarget: 'home' }),
    ];

    expect(buildStorefrontPreviewSections(sections, 'home').map(item => item.id)).toEqual([10, 12]);
  });

  it('uses a page footer when no global footer exists', () => {
    const sections = [
      section({ id: 1, type: 'hero', order: 1, pageTarget: 'home' }),
      section({ id: 2, type: 'footer', order: 2, pageTarget: 'home' }),
    ];

    expect(buildStorefrontPreviewSections(sections, 'home').map(item => item.id)).toEqual([1, 2]);
  });

  it('skips inactive chrome and body sections', () => {
    const sections = [
      section({ id: 1, type: 'header', order: 1, pageTarget: 'home', isActive: false }),
      section({ id: 2, type: 'hero', order: 2, pageTarget: 'home' }),
      section({ id: 3, type: 'about', order: 3, pageTarget: 'home', isActive: false }),
    ];

    expect(buildStorefrontPreviewSections(sections, 'home').map(item => item.id)).toEqual([2]);
  });
});
