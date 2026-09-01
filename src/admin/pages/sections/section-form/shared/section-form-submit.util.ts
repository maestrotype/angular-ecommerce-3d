import { getLocalizedString } from '../../../../../shared/utils/localization.util';
import {
  buildLocalizedNameFromForm,
  mapLocalizedSettingsList,
} from './section-form-localization.util';

function findExistingCategory(
  categories: any[] | undefined,
  cat: any,
  index: number
): any {
  const list = categories || [];
  return (
    list.find((item) => item.slug && cat.slug && item.slug === cat.slug) ||
    list[index]
  );
}

function findExistingBrand(
  brands: any[] | undefined,
  brand: any,
  index: number
): any {
  const list = brands || [];
  return (
    list.find(
      (item) =>
        item.name &&
        brand.name &&
        getLocalizedString(item.name) === brand.name
    ) || list[index]
  );
}

export function buildSectionSubmitPayload(
  formValue: any,
  existingSettings: Record<string, any>,
  model3dUrl: string | null
): any {
  let formData: any;

        if (formValue.type === 'header') {
          formData = {
            type: formValue.type,
            title: formValue.title,
            subtitle: formValue.subtitle,
            content: formValue.content,
            imageUrl: formValue.imageUrl || '',
            isActive: formValue.isActive,
            model3dUrl: model3dUrl || '',
            show3d: formValue.show3d || false,
            showImage: formValue.showImage || true,
            pageTarget: formValue.pageTarget || 'home',
            variant: formValue.variant || 'default',
            anchorId: formValue.anchorId || '',
            settings: {
              ...existingSettings,
              logoUrl: formValue.logoUrl || '',
              showSearch: formValue.showSearch ?? true,
              showCart: formValue.showCart ?? true,
              showProfile: formValue.showProfile ?? true,
              menu: (formValue.menu || []).map((item: any) => ({
                ...item,
                title: {
                  en: item.title?.en || '',
                  ru: item.title?.ru || '',
                  ua: item.title?.ua || ''
                }
              }))
            }
          };
        } else if (formValue.type === 'categories') {
          formData = {
            type: 'categories',
            title: formValue.title,
            subtitle: formValue.subtitle,
            content: formValue.content,
            imageUrl: formValue.imageUrl || '',
            isActive: formValue.isActive,
            model3dUrl: model3dUrl || '',
            show3d: formValue.show3d || false,
            showImage: formValue.showImage || true,
            settings: {
              ...existingSettings,
              categories: (formValue.categories || []).map((cat: any, index: number) => {
                const existingCat = findExistingCategory((existingSettings as any)?.categories, cat, index);
                const name = buildLocalizedNameFromForm(cat.name, existingCat?.name);
                return {
                  ...cat,
                  name,
                  slug: cat.slug || getLocalizedString(name).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
                };
              })
            }
          };
        } else if (formValue.type === 'brands') {
          formData = {
            type: 'brands',
            title: formValue.title,
            subtitle: formValue.subtitle,
            content: formValue.content,
            imageUrl: '',
            isActive: formValue.isActive,
            model3dUrl: '',
            show3d: false,
            showImage: false,
            settings: {
              ...existingSettings,
              brands: (formValue.brands || []).map((brand: any, index: number) => {
                const existingBrand = findExistingBrand((existingSettings as any)?.brands, brand, index);
                return {
                  ...brand,
                  name: buildLocalizedNameFromForm(brand.name, existingBrand?.name)
                };
              })
            }
          };
        } else if (formValue.type === 'testimonials') {
          formData = {
            type: 'testimonials',
            title: formValue.title,
            subtitle: formValue.subtitle,
            content: formValue.content,
            imageUrl: formValue.imageUrl || '',
            isActive: formValue.isActive,
            model3dUrl: model3dUrl || '',
            show3d: formValue.show3d || false,
            showImage: formValue.showImage || true,
            pageTarget: formValue.pageTarget || 'home',
            variant: formValue.variant || 'default',
            anchorId: formValue.anchorId || '',
            settings: {
              ...existingSettings,
              testimonials: mapLocalizedSettingsList(
                formValue.testimonials,
                (existingSettings as any)?.testimonials,
                ['name', 'role', 'text']
              )
            }
          };
        } else if (formValue.type === 'features-grid') {
          formData = {
            type: 'features-grid',
            title: formValue.title,
            subtitle: formValue.subtitle,
            content: formValue.content,
            imageUrl: formValue.imageUrl || '',
            isActive: formValue.isActive,
            model3dUrl: model3dUrl || '',
            show3d: formValue.show3d || false,
            showImage: formValue.showImage || true,
            pageTarget: formValue.pageTarget || 'home',
            variant: formValue.variant || 'default',
            anchorId: formValue.anchorId || '',
            settings: {
              ...existingSettings,
              features: mapLocalizedSettingsList(
                formValue.features,
                (existingSettings as any)?.features,
                ['title', 'description']
              )
            }
          };
        } else if (formValue.type === 'faq') {
          formData = {
            type: 'faq',
            title: formValue.title,
            subtitle: formValue.subtitle,
            content: formValue.content,
            imageUrl: formValue.imageUrl || '',
            isActive: formValue.isActive,
            model3dUrl: model3dUrl || '',
            show3d: formValue.show3d || false,
            showImage: formValue.showImage || true,
            pageTarget: formValue.pageTarget || 'home',
            variant: formValue.variant || 'default',
            anchorId: formValue.anchorId || '',
            settings: {
              ...existingSettings,
              items: mapLocalizedSettingsList(
                formValue.faqItems,
                (existingSettings as any)?.items,
                ['question', 'answer']
              )
            }
          };
        } else if (formValue.type === 'stats') {
          formData = {
            type: 'stats',
            title: formValue.title,
            subtitle: formValue.subtitle,
            content: formValue.content,
            imageUrl: formValue.imageUrl || '',
            isActive: formValue.isActive,
            model3dUrl: model3dUrl || '',
            show3d: formValue.show3d || false,
            showImage: formValue.showImage || true,
            pageTarget: formValue.pageTarget || 'home',
            variant: formValue.variant || 'default',
            anchorId: formValue.anchorId || '',
            settings: {
              ...existingSettings,
              stats: mapLocalizedSettingsList(
                formValue.stats,
                (existingSettings as any)?.stats,
                ['label']
              )
            }
          };
        } else if (formValue.type === 'product-carousel') {
          formData = {
            type: 'product-carousel',
            title: formValue.title,
            subtitle: formValue.subtitle,
            content: formValue.content,
            imageUrl: formValue.imageUrl || '',
            isActive: formValue.isActive,
            model3dUrl: model3dUrl || '',
            show3d: false,
            showImage: false,
            pageTarget: formValue.pageTarget || 'home',
            variant: formValue.variant || 'default',
            anchorId: formValue.anchorId || '',
            settings: {
              ...existingSettings,
              mode: formValue.carouselMode || 'products',
              source: formValue.carouselSource || 'new',
              categories: formValue.carouselCategories || [],
              sortOrder: formValue.carouselSortOrder || 'newest',
              limit: Number(formValue.carouselLimit) || 8,
              autoplay: formValue.carouselAutoplay !== false,
              slides: formValue.carouselMode === 'custom'
                ? mapLocalizedSettingsList(
                    formValue.carouselSlides,
                    (existingSettings as any)?.slides,
                    ['title', 'subtitle']
                  ).map((slide: any) => ({
                    ...slide,
                    price: slide.price === '' || slide.price === null || slide.price === undefined
                      ? undefined
                      : Number(slide.price)
                  }))
                : (existingSettings as any)?.slides || []
            }
          };
        } else if (formValue.type === 'product-stage') {
          formData = {
            type: 'product-stage',
            title: formValue.title,
            subtitle: formValue.subtitle,
            content: formValue.content,
            imageUrl: formValue.imageUrl || '',
            isActive: formValue.isActive,
            model3dUrl: '',
            show3d: true,
            showImage: false,
            pageTarget: formValue.pageTarget || 'home',
            variant: formValue.variant || 'default',
            anchorId: formValue.anchorId || 'product-stage',
            settings: {
              ...existingSettings,
              categories: formValue.stageCategories || [],
              productIds: (formValue.stageProductIds || [])
                .map((id: unknown) => Number(id))
                .filter((id: number) => Number.isFinite(id) && id > 0),
              limit: Number(formValue.stageLimit) || 5,
              autoRotate: formValue.stageAutoRotate !== false,
            }
          };
        } else if (formValue.type === 'lookbook') {
          formData = {
            type: 'lookbook',
            title: formValue.title,
            subtitle: formValue.subtitle,
            content: formValue.content,
            imageUrl: formValue.imageUrl || '',
            isActive: formValue.isActive,
            model3dUrl: model3dUrl || '',
            show3d: false,
            showImage: true,
            pageTarget: formValue.pageTarget || 'home',
            variant: formValue.variant || 'default',
            anchorId: formValue.anchorId || '',
            settings: {
              ...existingSettings,
              autoplay: formValue.carouselAutoplay !== false,
              slides: mapLocalizedSettingsList(
                formValue.lookbookSlides,
                (existingSettings as any)?.slides,
                ['title', 'subtitle', 'ctaLabel']
              )
            }
          };
        } else if (formValue.type === 'video-hero') {
          formData = {
            type: 'video-hero',
            title: formValue.title,
            subtitle: formValue.subtitle,
            content: formValue.content,
            imageUrl: formValue.imageUrl || '',
            isActive: formValue.isActive,
            model3dUrl: '',
            show3d: false,
            showImage: true,
            pageTarget: formValue.pageTarget || 'home',
            variant: formValue.variant || 'default',
            anchorId: formValue.anchorId || '',
            settings: {
              ...existingSettings,
              videoUrl: formValue.videoUrl || '',
              posterImage: formValue.imageUrl || '',
              autoplay: formValue.videoAutoplay !== false,
              muted: formValue.videoMuted !== false,
              loop: formValue.videoLoop !== false,
              controls: formValue.videoControls === true,
              overlayOpacity: Number(formValue.videoOverlayOpacity ?? 0.5),
              alignment: formValue.videoAlignment || 'center',
              showPlayButton: formValue.videoShowPlayButton !== false,
              ctaText: buildLocalizedNameFromForm(
                formValue.videoCtaText,
                (existingSettings as any)?.ctaText
              ),
              ctaLink: formValue.videoCtaLink || '/shop',
              secondaryCtaText: buildLocalizedNameFromForm(
                formValue.videoSecondaryCtaText,
                (existingSettings as any)?.secondaryCtaText
              ),
              secondaryCtaLink: formValue.videoSecondaryCtaLink || '/about'
            }
          };
        } else if (formValue.type === 'blog-posts') {
          formData = {
            type: 'blog-posts',
            title: formValue.title,
            subtitle: formValue.subtitle,
            content: formValue.content,
            imageUrl: formValue.imageUrl || '',
            isActive: formValue.isActive,
            model3dUrl: '',
            show3d: false,
            showImage: true,
            pageTarget: formValue.pageTarget || 'home',
            variant: formValue.variant || 'default',
            anchorId: formValue.anchorId || '',
            settings: {
              ...existingSettings,
              displayMode: formValue.blogDisplayMode || 'grid',
              showCta: formValue.blogShowCta !== false,
              ctaText: buildLocalizedNameFromForm(
                formValue.blogCtaText,
                (existingSettings as any)?.ctaText
              ),
              ctaLink: formValue.blogCtaLink || '/shop',
              blogPosts: mapLocalizedSettingsList(
                formValue.blogPosts,
                (existingSettings as any)?.blogPosts,
                ['title', 'excerpt']
              )
            }
          };
        } else if (formValue.type === 'newsletter') {
          formData = {
            type: 'newsletter',
            title: formValue.title,
            subtitle: formValue.subtitle,
            content: formValue.content,
            imageUrl: formValue.imageUrl || '',
            isActive: formValue.isActive,
            model3dUrl: model3dUrl || '',
            show3d: formValue.show3d || false,
            showImage: formValue.showImage || false,
            pageTarget: formValue.pageTarget || 'home',
            variant: formValue.variant || 'default',
            anchorId: formValue.anchorId || '',
            settings: {
              ...existingSettings,
              placeholder: buildLocalizedNameFromForm(
                formValue.newsletterPlaceholder,
                (existingSettings as any)?.placeholder
              ),
              buttonText: buildLocalizedNameFromForm(
                formValue.newsletterButtonText,
                (existingSettings as any)?.buttonText
              )
            }
          };
        } else if (formValue.type === 'footer') {
          formData = {
            ...formValue,
            pageTarget: 'global', // Footer is usually global
            settings: {
              ...existingSettings,
              social: formValue.social,
              copyright: formValue.copyright,
              columns: formValue.columns
            }
          };
        } else {
          formData = {
            ...formValue,
            pageTarget: formValue.pageTarget || 'home',
            variant: formValue.variant || 'default',
            anchorId: formValue.anchorId || '',
            model3dUrl: model3dUrl || ''
            // NOTE: Explicitly NOT sending `settings` here so we don't accidentally trample
            // visualOverrides set by the Site Architect toolbar during an active session!
          };
        }

  return formData;
}
