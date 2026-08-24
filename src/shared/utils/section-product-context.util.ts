import { Product } from '../models/product.model';
import { PageSectionContext } from '../models/page-section-context.model';

export function isPageSectionContext(value: unknown): value is PageSectionContext {
  if (!value || typeof value !== 'object') {
    return false;
  }

  return 'bestSellers' in value || 'specialOffers' in value;
}

/** Resolves a PDP product from section renderer context (ignores page-level context objects). */
export function resolveProductFromSectionContext(context: unknown): Product | null {
  if (!context || typeof context !== 'object' || isPageSectionContext(context)) {
    return null;
  }

  const candidate = context as Product;
  if (typeof candidate.id === 'number' && Number.isFinite(candidate.id) && candidate.id > 0) {
    return candidate;
  }

  return null;
}

/** Product id from PDP context or optional section settings fallback. */
export function resolveRecommendationProductId(
  context: unknown,
  settings?: { productId?: number | string } | null
): number | null {
  const fromContext = resolveProductFromSectionContext(context);
  if (fromContext) {
    return fromContext.id;
  }

  const settingsId = settings?.productId;
  const parsed = typeof settingsId === 'number' ? settingsId : Number(settingsId);
  if (Number.isFinite(parsed) && parsed > 0) {
    return parsed;
  }

  return null;
}
