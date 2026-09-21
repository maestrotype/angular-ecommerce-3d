import { Product } from '../models/product.model';

export function isDemoProduct(product: Pick<Product, 'id' | 'isDemo'> | null | undefined): boolean {
  if (!product) {
    return false;
  }
  return product.isDemo === true || product.id < 0;
}

export function isDemoProductId(productId: number | string | null | undefined): boolean {
  const id = Number(productId);
  return Number.isFinite(id) && id < 0;
}
