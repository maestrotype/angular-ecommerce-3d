import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { PRODUCT_FORM_SAMPLE_DRAFT, sampleDraftForCategory } from './product-form.demo-values';
import {
  ProductFormPrefillService,
  areSpecificationsEmpty,
  isProductFormScalarEmpty,
} from './product-form-prefill.service';

function createProductForm(fb: FormBuilder, overrides: Record<string, unknown> = {}): FormGroup {
  return fb.group({
    name_en: [overrides['name_en'] ?? ''],
    name_ru: [''],
    name_ua: [''],
    category: [overrides['category'] ?? ''],
    price: [overrides['price'] ?? 0],
    stock: [overrides['stock'] ?? 0],
    description_en: [overrides['description_en'] ?? ''],
    description_ru: [''],
    description_ua: [''],
    specifications: fb.array([]),
  });
}

describe('ProductFormPrefillService', () => {
  const fb = new FormBuilder();
  const service = new ProductFormPrefillService(fb);

  it('treats default price and stock 0 as empty', () => {
    expect(isProductFormScalarEmpty('price', 0)).toBe(true);
    expect(isProductFormScalarEmpty('stock', 0)).toBe(true);
    expect(isProductFormScalarEmpty('price', 129)).toBe(false);
    expect(isProductFormScalarEmpty('name_en', '  ')).toBe(true);
  });

  it('fills empty controls from the sample draft on merge', () => {
    const form = createProductForm(fb);
    const draft = { ...PRODUCT_FORM_SAMPLE_DRAFT, category: 'bags' };

    const result = service.applyDraft(form, draft, 'merge');

    expect(result.changed).toBe(true);
    expect(form.get('name_en')?.value).toBe(PRODUCT_FORM_SAMPLE_DRAFT.name_en);
    expect(form.get('name_ru')?.value).toBe(PRODUCT_FORM_SAMPLE_DRAFT.name_ru);
    expect(form.get('price')?.value).toBe(PRODUCT_FORM_SAMPLE_DRAFT.price);
    expect(form.get('category')?.value).toBe('bags');
    expect((form.get('specifications') as FormArray).length).toBe(2);
  });

  it('keeps filled fields on merge and reports them as conflicts', () => {
    const form = createProductForm(fb, { name_en: 'My Lamp', price: 10 });
    const draft = { ...PRODUCT_FORM_SAMPLE_DRAFT, category: 'bags' };

    expect(service.findConflicts(form, draft)).toEqual(['name_en', 'price']);

    service.applyDraft(form, draft, 'merge');

    expect(form.get('name_en')?.value).toBe('My Lamp');
    expect(form.get('price')?.value).toBe(10);
    expect(form.get('description_en')?.value).toBe(PRODUCT_FORM_SAMPLE_DRAFT.description_en);
  });

  it('overwrites filled fields when asked', () => {
    const form = createProductForm(fb, { name_en: 'My Lamp', price: 10 });
    const draft = { ...PRODUCT_FORM_SAMPLE_DRAFT, category: 'bags' };

    service.applyDraft(form, draft, 'overwrite');

    expect(form.get('name_en')?.value).toBe(PRODUCT_FORM_SAMPLE_DRAFT.name_en);
    expect(form.get('price')?.value).toBe(PRODUCT_FORM_SAMPLE_DRAFT.price);
  });

  it('restores the snapshot on undo', () => {
    const form = createProductForm(fb, { name_en: 'Keep me' });
    const draft = { ...PRODUCT_FORM_SAMPLE_DRAFT, category: 'shoes' };

    const { snapshot } = service.applyDraft(form, draft, 'merge');
    expect(form.get('name_ua')?.value).toBe(PRODUCT_FORM_SAMPLE_DRAFT.name_ua);

    service.restoreSnapshot(form, snapshot);

    expect(form.get('name_en')?.value).toBe('Keep me');
    expect(form.get('name_ua')?.value).toBe('');
    expect(areSpecificationsEmpty((form.get('specifications') as FormArray).getRawValue())).toBe(true);
  });
});

describe('sampleDraftForCategory', () => {
  it('returns sneaker copy for shoes, not an unrelated product', () => {
    const draft = sampleDraftForCategory('shoes');
    expect(draft.name_en).toContain('Sneaker');
    expect(draft.description_en?.toLowerCase()).toContain('sneaker');
    expect(draft.description_ru?.toLowerCase()).toContain('кроссов');
  });

  it('returns bag copy for handbags aliases', () => {
    expect(sampleDraftForCategory('handbags').name_en).toContain('Crossbody');
  });

  it('defaults to the shoes catalog sample', () => {
    expect(sampleDraftForCategory('').name_en).toBe(PRODUCT_FORM_SAMPLE_DRAFT.name_en);
    expect(sampleDraftForCategory('electronics').name_en).toBe(PRODUCT_FORM_SAMPLE_DRAFT.name_en);
  });
});
