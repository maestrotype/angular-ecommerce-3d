export interface ProductFormSpecDraft {
  key: string;
  value: string;
}

/** Shared draft for L0 sample fill, L1 page-read, and L2 AI copy. */
export interface ProductFormDraft {
  name_en?: string;
  name_ru?: string;
  name_ua?: string;
  category?: string;
  price?: number;
  stock?: number;
  description_en?: string;
  description_ru?: string;
  description_ua?: string;
  specifications?: ProductFormSpecDraft[];
}

export const PRODUCT_FORM_SCALAR_KEYS = [
  'name_en',
  'name_ru',
  'name_ua',
  'category',
  'price',
  'stock',
  'description_en',
  'description_ru',
  'description_ua',
] as const;

export type ProductFormScalarKey = (typeof PRODUCT_FORM_SCALAR_KEYS)[number];

export interface ProductFormPrefillSnapshot {
  scalars: Record<ProductFormScalarKey, string | number>;
  specifications: ProductFormSpecDraft[];
}
