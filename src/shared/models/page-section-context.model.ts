import { Product } from './product.model';

/** Page-level data shared with section components via SectionRenderer contextData. */
export interface PageSectionContext {
  bestSellers?: Product[];
  specialOffers?: Product[];
  catalog?: Product[];
}
