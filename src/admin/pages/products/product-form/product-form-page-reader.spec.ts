import {
  draftFromProductPage,
  isProductPageReadable,
  titleFromImageUrl,
} from './product-form-page-reader';

describe('titleFromImageUrl', () => {
  it('turns a product filename into a title', () => {
    expect(titleFromImageUrl('https://cdn.example.com/catalog/red-court-sneaker.jpg')).toBe('Red Court Sneaker');
  });

  it('ignores generic upload names', () => {
    expect(titleFromImageUrl('/uploads/image.png')).toBe('');
    expect(titleFromImageUrl('/uploads/photo_1234567890.jpg')).toBe('');
  });
});

describe('draftFromProductPage', () => {
  it('is not readable on an empty form', () => {
    expect(isProductPageReadable({})).toBe(false);
  });

  it('fills empty names from a sneaker photo instead of a lamp sample', () => {
    const draft = draftFromProductPage({
      category: 'shoes',
      imageUrls: ['https://res.cloudinary.com/demo/sneaker.png'],
    });
    expect(draft.name_en).toBe('Sneaker');
    expect(draft.description_en?.toLowerCase()).toContain('sneaker');
    expect(draft.description_en?.toLowerCase()).not.toContain('lamp');
    expect(draft.description_ru?.toLowerCase()).not.toContain('абажур');
  });

  it('keeps an existing product name and writes empty descriptions around it', () => {
    const draft = draftFromProductPage({
      name_en: 'Court Runner',
      category: 'shoes',
      categoryLabel: 'Shoes',
      imageUrls: ['https://cdn.example.com/sneaker.png'],
    });
    expect(draft.name_en).toBeUndefined();
    expect(draft.description_en).toContain('Court Runner');
    expect(draft.description_en?.toLowerCase()).not.toContain('velocity');
  });
});
