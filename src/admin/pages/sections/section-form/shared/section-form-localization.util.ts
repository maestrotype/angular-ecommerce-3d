import { LocalizedString } from '../../../../../shared/models/localized-string.model';

export function getLocalizedValue(value: unknown, lang: string): string {
  if (!value) return '';
  if (typeof value === 'string') return lang === 'en' ? value : '';
  if (typeof value === 'object' && value !== null) {
    return (value as Record<string, string>)[lang] || '';
  }
  return '';
}

export function buildLocalizedNameFromForm(
  formName: string,
  existingName: string | LocalizedString | undefined
): LocalizedString {
  const existing =
    typeof existingName === 'object' && existingName !== null
      ? existingName
      : {
          en: typeof existingName === 'string' ? existingName : '',
          ru: '',
          ua: '',
        };

  return {
    en: formName || '',
    ru: existing.ru || '',
    ua: existing.ua || '',
  };
}

export function mapLocalizedSettingsList(
  items: any[] | undefined,
  existingItems: any[] | undefined,
  localizedFields: string[]
): any[] {
  return (items || []).map((item, index) => {
    const existing = (existingItems || [])[index];
    const mapped = { ...item };
    localizedFields.forEach((field) => {
      mapped[field] = buildLocalizedNameFromForm(item[field], existing?.[field]);
    });
    return mapped;
  });
}

export function packLocalizedFields(formValue: any): any {
  const data = { ...formValue };

  data.title = {
    en: formValue.title_en,
    ru: formValue.title_ru,
    ua: formValue.title_ua,
  };

  data.subtitle = {
    en: formValue.subtitle_en,
    ru: formValue.subtitle_ru,
    ua: formValue.subtitle_ua,
  };

  data.content = {
    en: formValue.content_en,
    ru: formValue.content_ru,
    ua: formValue.content_ua,
  };

  if (formValue.type === 'lookbook') {
    data.settings = {
      autoplay: formValue.carouselAutoplay !== false,
      slides: mapLocalizedSettingsList(formValue.lookbookSlides, undefined, [
        'title',
        'subtitle',
        'ctaLabel',
      ]),
    };
  }

  if (formValue.type === 'product-carousel') {
    data.settings = {
      mode: formValue.carouselMode || 'products',
      source: formValue.carouselSource || 'new',
      categories: formValue.carouselCategories || [],
      sortOrder: formValue.carouselSortOrder || 'newest',
      limit: Number(formValue.carouselLimit) || 8,
      autoplay: formValue.carouselAutoplay !== false,
      slides:
        formValue.carouselMode === 'custom'
          ? mapLocalizedSettingsList(formValue.carouselSlides, undefined, [
              'title',
              'subtitle',
            ]).map((slide: any) => ({
              ...slide,
              price:
                slide.price === '' ||
                slide.price === null ||
                slide.price === undefined
                  ? undefined
                  : Number(slide.price),
            }))
          : [],
    };
  }

  if (formValue.type === 'product-stage') {
    data.settings = {
      categories: formValue.stageCategories || [],
      productIds: (formValue.stageProductIds || [])
        .map((id: unknown) => Number(id))
        .filter((id: number) => Number.isFinite(id) && id > 0),
      limit: Number(formValue.stageLimit) || 5,
      autoRotate: formValue.stageAutoRotate !== false,
    };
  }

  if (formValue.type === 'video-hero') {
    data.settings = {
      videoUrl: formValue.videoUrl || '',
      posterImage: formValue.imageUrl || '',
      autoplay: formValue.videoAutoplay !== false,
      muted: formValue.videoMuted !== false,
      loop: formValue.videoLoop !== false,
      controls: formValue.videoControls === true,
      overlayOpacity: Number(formValue.videoOverlayOpacity ?? 0.5),
      alignment: formValue.videoAlignment || 'center',
      showPlayButton: formValue.videoShowPlayButton !== false,
      ctaText: formValue.videoCtaText || '',
      ctaLink: formValue.videoCtaLink || '/shop',
      secondaryCtaText: formValue.videoSecondaryCtaText || '',
      secondaryCtaLink: formValue.videoSecondaryCtaLink || '/about',
    };
  }

  if (formValue.type === 'blog-posts') {
    data.settings = {
      displayMode: formValue.blogDisplayMode || 'grid',
      showCta: formValue.blogShowCta !== false,
      ctaText: formValue.blogCtaText || '',
      ctaLink: formValue.blogCtaLink || '/shop',
      blogPosts: mapLocalizedSettingsList(formValue.blogPosts, undefined, [
        'title',
        'excerpt',
      ]),
    };
  }

  delete data.title_en;
  delete data.title_ru;
  delete data.title_ua;
  delete data.subtitle_en;
  delete data.subtitle_ru;
  delete data.subtitle_ua;
  delete data.content_en;
  delete data.content_ru;
  delete data.content_ua;

  return data;
}
