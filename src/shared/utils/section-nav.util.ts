import { LocalizedString } from '../models/localized-string.model';
import { MenuItem, Section } from '../models/section.model';
import { getSectionAnchorId, getSectionHash } from './section-anchor.util';

/** Chrome / intro blocks — not destinations in the header nav. */
export const NAV_EXCLUDED_SECTION_TYPES = new Set([
  'header',
  'footer',
  'hero',
  'hero-glass',
  'video-hero',
  'product-stage',
  'product-tabs',
  'html-content',
  'similar-products',
  'bought-together',
]);

const PINNED_ROUTES = new Set(['/', '/home', '/shop']);

const SECTION_NAV_FALLBACK_TITLE: Record<string, string> = {
  'best-sellers': 'Best Sellers',
  'product-carousel': 'New This Season',
  lookbook: 'Lookbook',
  'blog-posts': 'Blog',
  categories: 'Categories',
  'special-offer': 'Special Offer',
  brands: 'Brands',
  testimonials: 'Testimonials',
  newsletter: 'Newsletter',
  'features-grid': 'Features',
  faq: 'FAQ',
  stats: 'Stats',
  contacts: 'Contacts',
  about: 'About',
  'similar-products': 'Similar Products',
  'bought-together': 'Bought Together',
};

export function isHomePageSection(
  section: Pick<Section, 'pageTarget' | 'isActive'>
): boolean {
  if (section.isActive === false) {
    return false;
  }
  const target = section.pageTarget || '';
  return target === 'home';
}

export function hasNavTitle(title: string | LocalizedString | null | undefined): boolean {
  if (!title) {
    return false;
  }
  if (typeof title === 'string') {
    return title.trim().length > 0;
  }
  return Object.values(title).some(value => typeof value === 'string' && value.trim().length > 0);
}

export function isSectionNavEligible(
  section: Pick<Section, 'type' | 'isActive' | 'pageTarget' | 'settings'>
): boolean {
  if (!isHomePageSection(section)) {
    return false;
  }
  if (section.settings?.['showInNav'] === false) {
    return false;
  }
  if (NAV_EXCLUDED_SECTION_TYPES.has(section.type)) {
    return section.settings?.['showInNav'] === true;
  }
  return true;
}

export function sectionNavTitle(section: Pick<Section, 'type' | 'title'>): string | LocalizedString {
  if (hasNavTitle(section.title)) {
    return section.title as string | LocalizedString;
  }
  return SECTION_NAV_FALLBACK_TITLE[section.type] || section.type;
}

export function menuItemCoversSection(
  item: Pick<MenuItem, 'url'>,
  section: Pick<Section, 'anchorId' | 'type'>
): boolean {
  const url = (item.url || '').trim();
  if (!url) {
    return false;
  }
  const anchor = getSectionAnchorId(section);
  const hash = getSectionHash(section);
  if (url === hash || url === `#${section.type}` || url === `#${anchor}`) {
    return true;
  }
  const path = url.split('?')[0].replace(/\/$/, '') || '/';
  return path === `/${section.type}` || path === `/${anchor}`;
}

function isPinnedRoute(url: string): boolean {
  const path = (url || '').split('?')[0].replace(/\/$/, '') || '/';
  return PINNED_ROUTES.has(path);
}

function isAdminUrl(url: string): boolean {
  return (url || '').toLowerCase().includes('/admin');
}

function isExternalUrl(url: string): boolean {
  return /^(https?:)?\/\//i.test(url || '');
}

/**
 * Keep Home / Shop / Admin as routes. Bind other header items to live home
 * sections (hash), then append any installed home sections that have no item.
 */
export function mergeHeaderMenuWithHomeSections(
  configured: MenuItem[],
  homeSections: Section[]
): MenuItem[] {
  const eligible = [...homeSections]
    .filter(isSectionNavEligible)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const activeConfigured = configured.filter(item => item.isActive !== false && !!item.url);

  const rewritten = activeConfigured.map(item => {
    if (isPinnedRoute(item.url) || isAdminUrl(item.url) || isExternalUrl(item.url)) {
      return item;
    }
    const match = eligible.find(section => menuItemCoversSection(item, section));
    if (!match) {
      return item;
    }
    return {
      ...item,
      url: getSectionHash(match),
      title: hasNavTitle(item.title) ? item.title : sectionNavTitle(match),
    };
  });

  const homeItem = rewritten.find(item => isPinnedRoute(item.url) && item.url !== '/shop');
  const shopItem = rewritten.find(item => (item.url || '').split('?')[0] === '/shop');
  const adminItems = rewritten.filter(item => isAdminUrl(item.url));

  const sectionItems: MenuItem[] = [];
  const placed = new Set<MenuItem>();

  for (const section of eligible) {
    const existing = rewritten.find(
      item =>
        !isPinnedRoute(item.url) &&
        !isAdminUrl(item.url) &&
        menuItemCoversSection(item, section)
    );
    if (existing) {
      if (!placed.has(existing)) {
        sectionItems.push(existing);
        placed.add(existing);
      }
    } else {
      sectionItems.push({
        title: sectionNavTitle(section),
        url: getSectionHash(section),
        access: 'all',
        isActive: true,
      });
    }
  }

  const leftover = rewritten.filter(item => {
    if (item === homeItem || item === shopItem) {
      return false;
    }
    if (adminItems.includes(item) || placed.has(item)) {
      return false;
    }
    return true;
  });

  const merged = [homeItem, shopItem, ...sectionItems, ...leftover, ...adminItems].filter(
    (item): item is MenuItem => !!item
  );

  const seen = new Set<string>();
  return merged.filter(item => {
    const key = (item.url || '').trim().toLowerCase();
    if (!key || seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}
