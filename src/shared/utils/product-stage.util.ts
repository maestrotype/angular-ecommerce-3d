import { Product } from '../models/product.model';
import { filterProductsByCategorySlugs } from './shop-catalog.util';
import { resolveBundledModelPath } from '../constants/demo-model-paths';

export const DEFAULT_STAGE_CATEGORIES = ['bags', 'clothing', 'shoes'];
export const DEFAULT_STAGE_LIMIT = 5;

const STAGE_CATEGORY_ALIASES: Record<string, string[]> = {
  bags: ['handbags'],
  handbags: ['bags'],
};

export function expandStageCategories(categories: string[]): string[] {
  const expanded = new Set<string>();
  for (const slug of categories) {
    const key = slug.trim().toLowerCase();
    if (!key) {
      continue;
    }
    expanded.add(key);
    for (const alias of STAGE_CATEGORY_ALIASES[key] || []) {
      expanded.add(alias);
    }
  }
  return [...expanded];
}

export function productHas3dModel(product: Product): boolean {
  return !!(product.model3dUrl || product.localModel3dUrl);
}

export function stageModelPath(product: Product | null | undefined): string {
  if (!product) {
    return '';
  }
  return resolveBundledModelPath(product.model3dUrl || product.localModel3dUrl || '');
}

export function pickStageProducts(
  products: Product[],
  options: {
    productIds?: Array<number | string>;
    categories?: string[];
    limit?: number;
  } = {},
): Product[] {
  const with3d = products.filter(productHas3dModel);
  const limit = Math.min(Math.max(Number(options.limit) || DEFAULT_STAGE_LIMIT, 1), 8);
  const ids = (options.productIds || [])
    .map((id) => Number(id))
    .filter((id) => Number.isFinite(id) && id > 0);

  const selected: Product[] = [];
  for (const id of ids) {
    const match = with3d.find((product) => product.id === id);
    if (match && !selected.some((item) => item.id === match.id)) {
      selected.push(match);
    }
  }

  if (selected.length >= limit) {
    return selected.slice(0, limit);
  }

  const categories = expandStageCategories(
    options.categories && options.categories.length
      ? options.categories
      : DEFAULT_STAGE_CATEGORIES,
  );
  const byCategory = filterProductsByCategorySlugs(
    with3d.filter((product) => !selected.some((item) => item.id === product.id)),
    categories,
  );
  const fillerSource = byCategory.length
    ? byCategory
    : with3d.filter((product) => !selected.some((item) => item.id === product.id));

  return [...selected, ...fillerSource].slice(0, limit);
}
