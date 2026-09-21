import { ProductFormDraft } from './product-form-draft.model';

const SHOES_SAMPLE: ProductFormDraft = {
  name_en: 'Velocity Court Sneaker',
  name_ru: 'Кроссовки Velocity',
  name_ua: 'Кросівки Velocity',
  price: 139,
  stock: 24,
  description_en:
    'A court sneaker with a breathable mesh upper and a cupped rubber sole. Rotate the 3D model to check the heel stack, outsole, and side profile before you publish.',
  description_ru:
    'Кроссовки с сетчатым верхом и чашевидной резиновой подошвой. В 3D можно оценить каблук, подмётку и профиль до публикации.',
  description_ua:
    'Кросівки з сітчастим верхом і чашоподібною гумовою підошвою. У 3D можна оцінити каблук, підметку та профіль до публікації.',
  specifications: [
    { key: 'Material', value: 'Mesh + rubber' },
    { key: 'Sizes', value: 'EU 38–46' },
  ],
};

const BAGS_SAMPLE: ProductFormDraft = {
  name_en: 'Arc Mini Crossbody',
  name_ru: 'Сумка Arc Mini',
  name_ua: 'Сумка Arc Mini',
  price: 179,
  stock: 16,
  description_en:
    'A compact sculpted crossbody with a flap closure and an adjustable strap. Orbit the 3D model to check the silhouette and hardware on a shoulder or across the chest.',
  description_ru:
    'Компактная сумка через плечо с клапаном и регулируемым ремнём. В 3D видно силуэт и фурнитуру на плече или на груди.',
  description_ua:
    'Компактна сумка через плече з клапаном і регульованим ременем. У 3D видно силует і фурнітуру на плечі або на грудях.',
  specifications: [
    { key: 'Material', value: 'Grain leather' },
    { key: 'Strap', value: 'Adjustable' },
  ],
};

const CLOTHING_SAMPLE: ProductFormDraft = {
  name_en: 'Heavyweight Studio Tee',
  name_ru: 'Футболка Studio',
  name_ua: 'Футболка Studio',
  price: 42,
  stock: 48,
  description_en:
    'A heavyweight cotton tee with a relaxed shoulder and a clean crew neck. Use 3D to check drape and length on the body before you set size notes.',
  description_ru:
    'Плотная хлопковая футболка со свободной линией плеча и круглой горловиной. В 3D видно посадку и длину до заполнения размеров.',
  description_ua:
    'Щільна бавовняна футболка з вільною лінією плеча та круглою горловиною. У 3D видно посадку й довжину до заповнення розмірів.',
  specifications: [
    { key: 'Material', value: '100% cotton' },
    { key: 'Fit', value: 'Relaxed' },
  ],
};

const SAMPLE_BY_FAMILY = {
  shoes: SHOES_SAMPLE,
  bags: BAGS_SAMPLE,
  clothing: CLOTHING_SAMPLE,
} as const;

type SampleFamily = keyof typeof SAMPLE_BY_FAMILY;

const CATEGORY_ALIASES: Record<string, SampleFamily> = {
  shoes: 'shoes',
  shoe: 'shoes',
  sneakers: 'shoes',
  sneaker: 'shoes',
  footwear: 'shoes',
  bags: 'bags',
  bag: 'bags',
  handbags: 'bags',
  handbag: 'bags',
  clothing: 'clothing',
  clothes: 'clothing',
  apparel: 'clothing',
  tshirt: 'clothing',
};

/** Default L0 fixture when the form has no category yet (fashion catalog). */
export const PRODUCT_FORM_SAMPLE_DRAFT: ProductFormDraft = SHOES_SAMPLE;

export function sampleDraftForCategory(category?: string | null): ProductFormDraft {
  const family = resolveSampleFamily(category);
  const draft = family ? SAMPLE_BY_FAMILY[family] : PRODUCT_FORM_SAMPLE_DRAFT;
  return { ...draft, specifications: draft.specifications?.map((row) => ({ ...row })) };
}

export function resolveSampleFamily(
  category?: string | null,
): keyof typeof SAMPLE_BY_FAMILY | null {
  const slug = String(category ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-');
  if (!slug) {
    return null;
  }
  if (slug in CATEGORY_ALIASES) {
    return CATEGORY_ALIASES[slug];
  }
  const token = slug.split('-').find((part) => part in CATEGORY_ALIASES);
  return token ? CATEGORY_ALIASES[token] : null;
}
