import { resolveSampleFamily } from './product-form.demo-values';
import { ProductFormDraft, ProductFormSpecDraft } from './product-form-draft.model';

const SKIP_FILENAME_TOKENS = new Set([
  'image',
  'img',
  'photo',
  'product',
  'upload',
  'untitled',
  'screenshot',
  'unknown',
  'file',
  'download',
  'asset',
  'media',
  'thumb',
  'thumbnail',
  'preview',
]);

export interface ProductPageReadInput {
  name_en?: string;
  name_ru?: string;
  name_ua?: string;
  category?: string;
  categoryLabel?: string;
  description_en?: string;
  description_ru?: string;
  description_ua?: string;
  specifications?: ProductFormSpecDraft[];
  imageUrls?: string[];
}

export function titleFromImageUrl(url: string): string {
  if (!url) {
    return '';
  }
  try {
    const path = decodeURIComponent(url.split('?')[0] || '');
    const file = path.split('/').pop() || '';
    const base = file.replace(/\.[a-z0-9]{2,5}$/i, '');
    const cleaned = base
      .replace(/[_-]+/g, ' ')
      .replace(/\d{6,}/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const words = cleaned.split(' ').filter((word) => {
      const token = word.toLowerCase();
      if (!token || SKIP_FILENAME_TOKENS.has(token)) {
        return false;
      }
      if (/^[a-f0-9]{8,}$/i.test(token)) {
        return false;
      }
      return true;
    });
    if (!words.length) {
      return '';
    }
    return words.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  } catch {
    return '';
  }
}

export function isProductPageReadable(input: ProductPageReadInput): boolean {
  const names = [input.name_en, input.name_ru, input.name_ua].some((value) => String(value ?? '').trim());
  const descriptions = [input.description_en, input.description_ru, input.description_ua].some((value) =>
    String(value ?? '').trim(),
  );
  const specs = (input.specifications || []).some(
    (row) => String(row.key ?? '').trim() || String(row.value ?? '').trim(),
  );
  return !!(names || descriptions || specs || String(input.category ?? '').trim() || input.imageUrls?.length);
}

function firstFilled(...values: Array<string | undefined>): string {
  for (const value of values) {
    const trimmed = String(value ?? '').trim();
    if (trimmed) {
      return trimmed;
    }
  }
  return '';
}

function specSummary(specs: ProductFormSpecDraft[] | undefined): string {
  const rows = (specs || [])
    .map((row) => ({ key: String(row.key ?? '').trim(), value: String(row.value ?? '').trim() }))
    .filter((row) => row.key && row.value)
    .slice(0, 6);
  if (!rows.length) {
    return '';
  }
  return rows.map((row) => `${row.key}: ${row.value}`).join('; ');
}

export function draftFromProductPage(input: ProductPageReadInput): ProductFormDraft {
  const imageTitle = (input.imageUrls || []).map(titleFromImageUrl).find((title) => !!title) || '';
  const existingName = firstFilled(input.name_en, input.name_ru, input.name_ua);
  const name = existingName || imageTitle;
  const category = String(input.category ?? '').trim();
  const family = resolveSampleFamily(category) || resolveSampleFamily(imageTitle) || resolveSampleFamily(name);
  const label = String(input.categoryLabel ?? '').trim() || family || category;
  const details = specSummary(input.specifications);
  const draft: ProductFormDraft = {};

  if (name) {
    if (!String(input.name_en ?? '').trim()) {
      draft.name_en = name;
    }
    if (!String(input.name_ru ?? '').trim()) {
      draft.name_ru = name;
    }
    if (!String(input.name_ua ?? '').trim()) {
      draft.name_ua = name;
    }
  }

  const descriptions = buildPageDescriptions({
    name: name || imageTitle || label || 'This product',
    label,
    family,
    details,
    imageTitle: existingName ? '' : imageTitle,
  });

  if (!String(input.description_en ?? '').trim()) {
    draft.description_en = descriptions.en;
  }
  if (!String(input.description_ru ?? '').trim()) {
    draft.description_ru = descriptions.ru;
  }
  if (!String(input.description_ua ?? '').trim()) {
    draft.description_ua = descriptions.ua;
  }

  return draft;
}

function buildPageDescriptions(args: {
  name: string;
  label: string;
  family: string | null;
  details: string;
  imageTitle: string;
}): { en: string; ru: string; ua: string } {
  const collectionEn = args.label || args.family || 'the catalog';
  const photoEn = args.imageTitle ? ` The uploaded photo (${args.imageTitle}) is the visual for this listing.` : '';
  const specsEn = args.details ? ` Details on the form: ${args.details}.` : '';
  const photoRu = args.imageTitle ? ` Загруженное фото (${args.imageTitle}) — визуал этой карточки.` : '';
  const specsRu = args.details ? ` Данные с формы: ${args.details}.` : '';
  const photoUa = args.imageTitle ? ` Завантажене фото (${args.imageTitle}) — візуал цієї картки.` : '';
  const specsUa = args.details ? ` Дані з форми: ${args.details}.` : '';

  return {
    en: `${args.name} is listed in ${collectionEn}.${photoEn}${specsEn} Check the photos and 3D viewer for scale, materials, and finish before you publish.`,
    ru: `${args.name} в категории «${collectionEn}».${photoRu}${specsRu} Сверьте фото и 3D-просмотр: масштаб, материалы и отделка до публикации.`,
    ua: `${args.name} у категорії «${collectionEn}».${photoUa}${specsUa} Звірте фото і 3D-перегляд: масштаб, матеріали й оздоблення до публікації.`,
  };
}
