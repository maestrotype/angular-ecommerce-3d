export const SECTION_TYPES = [
  { value: 'header', label: 'SECTION_TYPE_LABELS.HEADER' },
  { value: 'hero', label: 'SECTION_TYPE_LABELS.HERO' },
  { value: 'hero-glass', label: 'SECTION_TYPE_LABELS.HERO_GLASS' },
  { value: 'best-sellers', label: 'SECTION_TYPE_LABELS.BEST_SELLERS' },
  { value: 'product-carousel', label: 'SECTION_TYPE_LABELS.PRODUCT_CAROUSEL' },
  { value: 'lookbook', label: 'SECTION_TYPE_LABELS.LOOKBOOK' },
  { value: 'video-hero', label: 'SECTION_TYPE_LABELS.VIDEO_HERO' },
  { value: 'product-stage', label: 'SECTION_TYPE_LABELS.PRODUCT_STAGE' },
  { value: 'blog-posts', label: 'SECTION_TYPE_LABELS.BLOG_POSTS' },
  { value: 'categories', label: 'SECTION_TYPE_LABELS.CATEGORIES' },
  { value: 'special-offer', label: 'SECTION_TYPE_LABELS.SPECIAL_OFFER' },
  { value: 'brands', label: 'SECTION_TYPE_LABELS.BRANDS' },
  { value: 'testimonials', label: 'SECTION_TYPE_LABELS.TESTIMONIALS' },
  { value: 'newsletter', label: 'SECTION_TYPE_LABELS.NEWSLETTER' },
  { value: 'features-grid', label: 'SECTION_TYPE_LABELS.FEATURES_GRID' },
  { value: 'faq', label: 'SECTION_TYPE_LABELS.FAQ' },
  { value: 'stats', label: 'SECTION_TYPE_LABELS.STATS' },
  { value: 'contacts', label: 'SECTION_TYPE_LABELS.CONTACTS' },
  { value: 'about', label: 'SECTION_TYPE_LABELS.ABOUT' },
  { value: 'product-tabs', label: 'SECTION_TYPE_LABELS.PRODUCT_TABS' },
  { value: 'similar-products', label: 'SECTION_TYPE_LABELS.SIMILAR_PRODUCTS' },
  { value: 'bought-together', label: 'SECTION_TYPE_LABELS.BOUGHT_TOGETHER' },
  { value: 'html-content', label: 'SECTION_TYPE_LABELS.HTML_CONTENT' },
  { value: 'footer', label: 'SECTION_TYPE_LABELS.FOOTER' },
] as const;

export const SECTION_VARIANTS = [
  { value: 'default', label: 'VARIANT_DEFAULT' },
  { value: 'light', label: 'VARIANT_LIGHT' },
  { value: 'dark', label: 'VARIANT_DARK' },
  { value: 'glass', label: 'VARIANT_GLASS' },
  { value: 'light-soft', label: 'VARIANT_LIGHT_SOFT' },
  { value: 'dark-soft', label: 'VARIANT_DARK_SOFT' },
  { value: 'deep-dark', label: 'VARIANT_DEEP_DARK' },
  { value: 'glass-clear', label: 'VARIANT_GLASS_CLEAR' },
  { value: 'glass-deep', label: 'VARIANT_GLASS_DEEP' },
  { value: 'minimal', label: 'VARIANT_MINIMAL' },
] as const;

export const MENU_ACCESS_OPTIONS = [
  { value: 'all', label: 'HEADER_MENU_ACCESS_ALL' },
  { value: 'admin', label: 'HEADER_MENU_ACCESS_ADMIN' },
  { value: 'closed', label: 'HEADER_MENU_ACCESS_CLOSED' },
] as const;

export const CAROUSEL_SORT_OPTIONS = [
  { value: 'newest', label: 'CATALOG_SORT_NEWEST' },
  { value: 'name', label: 'CATALOG_SORT_NAME' },
  { value: 'price', label: 'CATALOG_SORT_PRICE' },
  { value: 'stock', label: 'CATALOG_SORT_STOCK' },
] as const;

export const STATIC_PAGE_TARGETS = [
  { value: 'home', label: 'TARGET_HOME', translate: true },
  { value: 'product', label: 'TARGET_PRODUCT', translate: true },
  { value: 'shop', label: 'TARGET_SHOP', translate: true },
] as const;

export const COMPONENT_SECTION_TYPES = [
  'categories',
  'brands',
  'testimonials',
  'features-grid',
  'faq',
  'stats',
  'newsletter',
  'lookbook',
  'blog-posts',
] as const;
