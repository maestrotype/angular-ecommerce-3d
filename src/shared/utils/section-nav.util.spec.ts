import { MenuItem, Section } from '../models/section.model';
import { mergeHeaderMenuWithHomeSections } from './section-nav.util';

function section(partial: Partial<Section> & Pick<Section, 'id' | 'type'>): Section {
  return {
    title: '',
    order: 0,
    isActive: true,
    pageTarget: 'home',
    ...partial,
  };
}

describe('mergeHeaderMenuWithHomeSections', () => {
  const configured: MenuItem[] = [
    { title: 'Home', url: '/home', access: 'all', isActive: true },
    { title: 'Shop', url: '/shop', access: 'all', isActive: true },
    { title: 'Brands', url: '/brands', access: 'all', isActive: true },
    { title: 'Contacts', url: '/contacts', access: 'all', isActive: true },
  ];

  it('rewrites route items to hashes when a home section exists and appends missing ones', () => {
    const home: Section[] = [
      section({ id: 1, type: 'hero', order: 1 }),
      section({
        id: 2,
        type: 'product-carousel',
        order: 2,
        title: { en: 'New This Season', ru: '', ua: '' },
        anchorId: 'product-carousel',
      }),
      section({ id: 3, type: 'brands', order: 3, title: { en: 'Brands', ru: '', ua: '' } }),
      section({
        id: 4,
        type: 'similar-products',
        order: 4,
        title: { en: 'Similar Products', ru: '', ua: '' },
      }),
      section({ id: 5, type: 'contacts', order: 5, title: { en: 'Contacts', ru: '', ua: '' } }),
    ];

    const menu = mergeHeaderMenuWithHomeSections(configured, home);
    const urls = menu.map(item => item.url);

    expect(urls[0]).toBe('/home');
    expect(urls[1]).toBe('/shop');
    expect(urls).toContain('#product-carousel');
    expect(urls).toContain('#brands');
    expect(urls).toContain('#contacts');
    expect(urls).not.toContain('#similar-products');
    expect(urls).not.toContain('/brands');
    expect(urls).not.toContain('/contacts');
    expect(urls).not.toContain('#hero');
  });
});
