import { Product } from '../models/product.model';
import {
  DEFAULT_STAGE_CATEGORIES,
  pickStageProducts,
  productHas3dModel,
  stageModelPath,
} from './product-stage.util';

function product(partial: Partial<Product> & Pick<Product, 'id' | 'name'>): Product {
  return {
    price: 10,
    imageUrl: '',
    ...partial,
  };
}

describe('product-stage util', () => {
  const bag = product({
    id: 1,
    name: 'Bag',
    category: 'bags',
    model3dUrl: '/bag.glb',
  });
  const shoe = product({
    id: 2,
    name: 'Shoe',
    category: 'shoes',
    model3dUrl: '/shoe.glb',
  });
  const tee = product({
    id: 3,
    name: 'Tee',
    category: 'clothing',
    localModel3dUrl: '/tee.glb',
  });
  const photoOnly = product({
    id: 4,
    name: 'Poster',
    category: 'bags',
  });

  it('detects GLB on either model field', () => {
    expect(productHas3dModel(bag)).toBe(true);
    expect(productHas3dModel(tee)).toBe(true);
    expect(productHas3dModel(photoOnly)).toBe(false);
    expect(stageModelPath(tee)).toBe('/tee.glb');
  });

  it('prefers explicit product ids then fills bags/clothing/shoes', () => {
    const picked = pickStageProducts([photoOnly, bag, shoe, tee], {
      productIds: [2],
      categories: DEFAULT_STAGE_CATEGORIES,
      limit: 3,
    });
    expect(picked.map((item) => item.id)).toEqual([2, 1, 3]);
  });

  it('treats handbags as bags', () => {
    const handbag = product({
      id: 8,
      name: 'Tote',
      category: 'handbags',
      model3dUrl: '/tote.glb',
    });
    const picked = pickStageProducts([handbag, shoe], {
      categories: ['bags'],
      limit: 2,
    });
    expect(picked.map((item) => item.id)).toEqual([8]);
  });

  it('falls back to any 3D product when category filter is empty', () => {
    const extra = product({
      id: 9,
      name: 'Car',
      category: 'cars',
      model3dUrl: '/car.glb',
    });
    const picked = pickStageProducts([extra], {
      categories: ['bags'],
      limit: 5,
    });
    expect(picked.map((item) => item.id)).toEqual([9]);
  });
});
