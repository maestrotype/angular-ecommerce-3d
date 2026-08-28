export type AdminCatalogSort = 'newest' | 'name' | 'price' | 'stock';
export type ShopCatalogSort = 'latest' | 'name' | 'price-low' | 'price-high' | 'rating' | 'stock';

export interface CatalogDisplaySettings {
  enabled: boolean;
  categories: string[];
  sortOrder: AdminCatalogSort;
}

/** @deprecated Use CatalogDisplaySettings */
export type ShopCatalogDisplaySettings = CatalogDisplaySettings;

export const DEFAULT_CATALOG_DISPLAY_SETTINGS: CatalogDisplaySettings = {
  enabled: false,
  categories: [],
  sortOrder: 'newest',
};

export const DEFAULT_SHOP_CATALOG_SETTINGS = DEFAULT_CATALOG_DISPLAY_SETTINGS;

export function normalizeCategoryRef(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export function productMatchesCategorySlugs(productCategory: string, slugs: string[]): boolean {
  if (!slugs.length) {
    return true;
  }
  const normalizedProduct = normalizeCategoryRef(productCategory);
  return slugs.some((slug) => normalizedProduct === normalizeCategoryRef(slug));
}

export function filterProductsByCategorySlugs<T extends { category?: string }>(
  products: T[],
  slugs: string[],
): T[] {
  if (!slugs.length) {
    return products;
  }
  return products.filter((product) => productMatchesCategorySlugs(product.category || '', slugs));
}

export function sortProductsByAdminSort<T extends {
  id: number;
  name?: string | Record<string, string>;
  price?: number;
  stock?: number;
  createdAt?: string | Date;
  imageUrl?: string;
}>(
  products: T[],
  sort: AdminCatalogSort,
  getDisplayName: (product: T) => string = (product) => {
    const name = product.name;
    if (!name) return '';
    if (typeof name === 'string') return name;
    return name.en || Object.values(name).find(Boolean) || '';
  },
): T[] {
  const copy = [...products];
  switch (sort) {
    case 'name':
      return copy.sort((a, b) => getDisplayName(a).localeCompare(getDisplayName(b), undefined, { sensitivity: 'base' }));
    case 'price':
      return copy.sort((a, b) => (a.price || 0) - (b.price || 0));
    case 'stock':
      return copy.sort((a, b) => (a.stock || 0) - (b.stock || 0));
    default:
      return copy.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        if (timeA !== timeB) return timeB - timeA;
        return (b.id || 0) - (a.id || 0);
      });
  }
}

export function mapAdminSortToShopSort(sort: AdminCatalogSort): ShopCatalogSort {
  switch (sort) {
    case 'name':
      return 'name';
    case 'price':
      return 'price-low';
    case 'stock':
      return 'stock';
    default:
      return 'latest';
  }
}

export function normalizeShopCatalogSettings(raw: Partial<CatalogDisplaySettings> | null | undefined): CatalogDisplaySettings {
  const sortOrder = raw?.sortOrder;
  const validSort: AdminCatalogSort =
    sortOrder === 'name' || sortOrder === 'price' || sortOrder === 'stock' ? sortOrder : 'newest';

  return {
    enabled: raw?.enabled === true,
    categories: Array.isArray(raw?.categories)
      ? raw!.categories.filter((slug): slug is string => typeof slug === 'string' && slug.trim().length > 0)
      : [],
    sortOrder: validSort,
  };
}

export const normalizeCatalogDisplaySettings = normalizeShopCatalogSettings;
