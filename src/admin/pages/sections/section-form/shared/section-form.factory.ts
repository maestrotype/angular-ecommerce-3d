import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MenuItem, Section } from '../../../../models/section.model';
import { LocalizedString } from '../../../../../shared/models/localized-string.model';
import { getLocalizedValue } from './section-form-localization.util';

export function getDefaultFooterColumns(): any[] {
  return [
      {
        title: { en: 'Quick Links', ru: 'Быстрые ссылки', ua: 'Швидкі посилання' },
        linkSource: 'manual',
        links: [
          { label: { en: 'Home', ru: 'Главная', ua: 'Головна' }, url: '/home' },
          { label: { en: 'Shop', ru: 'Магазин', ua: 'Магазин' }, url: '/shop' },
          { label: { en: 'About', ru: 'О нас', ua: 'Про нас' }, url: '/about' },
          { label: { en: 'Contacts', ru: 'Контакты', ua: 'Контакти' }, url: '/contacts' }
        ]
      },
      {
        title: { en: 'Categories', ru: 'Категории', ua: 'Категорії' },
        linkSource: 'shop-categories',
        links: []
      }
    ];
}

export function createSectionForm(fb: FormBuilder, section?: Section | null): FormGroup {
    // Map database type to display type
    let displayType = section?.type || 'hero';
    if (section?.type === 'categories') {
      displayType = 'categories'; // Use the value from sectionTypes
    }

    // Use a casted version of settings for easier access in TS
    const settings = section?.settings as any;

    return fb.group({
      type: [displayType, Validators.required],
      title_en: [getLocalizedValue(section?.title, 'en') || '', (displayType === 'header' || displayType === 'brands' || displayType === 'categories' || displayType === 'footer') ? [] : [Validators.required]],
      title_ru: [getLocalizedValue(section?.title, 'ru') || ''],
      title_ua: [getLocalizedValue(section?.title, 'ua') || ''],
      subtitle_en: [getLocalizedValue(section?.subtitle, 'en') || ''],
      subtitle_ru: [getLocalizedValue(section?.subtitle, 'ru') || ''],
      subtitle_ua: [getLocalizedValue(section?.subtitle, 'ua') || ''],
      content_en: [getLocalizedValue(section?.content, 'en') || ''],
      content_ru: [getLocalizedValue(section?.content, 'ru') || ''],
      content_ua: [getLocalizedValue(section?.content, 'ua') || ''],
      imageUrl: [section?.imageUrl || settings?.posterImage || ''],
      isActive: [section?.isActive ?? true],
      model3dUrl: [section?.model3dUrl || ''],
      show3d: [section?.show3d ?? false],
      showImage: [section?.showImage ?? true],
      pageTarget: [section?.pageTarget || 'home'],
      variant: [section?.variant || 'default'],
      anchorId: [section?.anchorId || ''],

      logoUrl: [settings?.logoUrl || ''],
      showSearch: [settings?.showSearch ?? true],
      showCart: [settings?.showCart ?? true],
      showProfile: [settings?.showProfile ?? true],
      menu: fb.array(
        (settings?.menu || []).map((item: MenuItem) => {
          let titleObj: LocalizedString;
          if (typeof item.title === 'string') {
            titleObj = { en: item.title, ru: item.title, ua: item.title };
          } else {
            titleObj = {
              en: item.title?.en || '',
              ru: item.title?.ru || '',
              ua: item.title?.ua || ''
            };
          }
          return fb.group({
            title: fb.group({
              en: [titleObj.en],
              ru: [titleObj.ru],
              ua: [titleObj.ua]
            }),
            url: [item.url, Validators.required],
            access: [item.access || 'all', Validators.required],
            isActive: [item.isActive ?? true],
            sectionId: [item['sectionId'] || null]
          });
        })
      ),
      categories: fb.array(
        (displayType === 'categories' ? (settings?.categories || []) : []).map((category: any) =>
          fb.group({
            name: [getLocalizedValue(category.name, 'en'), Validators.required],
            slug: [category.slug || '', Validators.required],
            icon: [category.icon],
            isActive: [category.isActive ?? true]
          })
        )
      ),
      brands: fb.array(
        (settings?.brands || []).map((brand: any) =>
          fb.group({
            name: [getLocalizedValue(brand.name, 'en'), Validators.required],
            logo: [brand.logo || ''],
            isActive: [brand.isActive ?? true]
          })
        )
      ),
      testimonials: fb.array(
        (settings?.testimonials || []).map((item: any) =>
          fb.group({
            name: [getLocalizedValue(item.name, 'en'), Validators.required],
            role: [getLocalizedValue(item.role, 'en')],
            text: [getLocalizedValue(item.text, 'en'), Validators.required],
            avatar: [item.avatar || ''],
            rating: [item.rating ?? 5, [Validators.min(1), Validators.max(5)]],
            isActive: [item.isActive ?? true]
          })
        )
      ),
      features: fb.array(
        (settings?.features || []).map((item: any) =>
          fb.group({
            icon: [item.icon || 'star', Validators.required],
            title: [getLocalizedValue(item.title, 'en'), Validators.required],
            description: [getLocalizedValue(item.description, 'en'), Validators.required],
            isActive: [item.isActive ?? true]
          })
        )
      ),
      faqItems: fb.array(
        (settings?.items || []).map((item: any) =>
          fb.group({
            question: [getLocalizedValue(item.question, 'en'), Validators.required],
            answer: [getLocalizedValue(item.answer, 'en'), Validators.required],
            isActive: [item.isActive ?? true]
          })
        )
      ),
      stats: fb.array(
        (settings?.stats || []).map((item: any) =>
          fb.group({
            value: [item.value || '', Validators.required],
            label: [getLocalizedValue(item.label, 'en'), Validators.required],
            suffix: [item.suffix || ''],
            isActive: [item.isActive ?? true]
          })
        )
      ),
      carouselSource: [settings?.source || 'new'],
      carouselMode: [settings?.mode || 'products'],
      carouselCategories: [
        displayType === 'product-carousel' && Array.isArray(settings?.categories)
          ? settings.categories.filter((slug: unknown): slug is string => typeof slug === 'string')
          : [],
      ],
      carouselSortOrder: [settings?.sortOrder || 'newest'],
      carouselLimit: [settings?.limit ?? 8, [Validators.min(3), Validators.max(16)]],
      carouselAutoplay: [settings?.autoplay !== false],
      carouselSlides: fb.array(
        (settings?.slides || []).map((item: any) =>
          fb.group({
            image: [item.image || '', Validators.required],
            title: [getLocalizedValue(item.title, 'en'), Validators.required],
            subtitle: [getLocalizedValue(item.subtitle, 'en')],
            link: [item.link || '/shop'],
            price: [item.price ?? ''],
            isActive: [item.isActive ?? true]
          })
        )
      ),
      lookbookSlides: fb.array(
        (settings?.slides || []).map((item: any) =>
          fb.group({
            image: [item.image || '', Validators.required],
            title: [getLocalizedValue(item.title, 'en'), Validators.required],
            subtitle: [getLocalizedValue(item.subtitle, 'en')],
            ctaLabel: [getLocalizedValue(item.ctaLabel, 'en')],
            ctaUrl: [item.ctaUrl || '/shop'],
            isActive: [item.isActive ?? true]
          })
        )
      ),
      videoUrl: [settings?.videoUrl || ''],
      videoCtaText: [getLocalizedValue(settings?.ctaText, 'en') || ''],
      videoCtaLink: [settings?.ctaLink || '/shop'],
      videoSecondaryCtaText: [getLocalizedValue(settings?.secondaryCtaText, 'en') || ''],
      videoSecondaryCtaLink: [settings?.secondaryCtaLink || '/about'],
      videoAutoplay: [settings?.autoplay !== false],
      videoMuted: [settings?.muted !== false],
      videoLoop: [settings?.loop !== false],
      videoControls: [settings?.controls === true],
      videoShowPlayButton: [settings?.showPlayButton !== false],
      videoOverlayOpacity: [settings?.overlayOpacity ?? 0.5, [Validators.min(0), Validators.max(1)]],
      videoAlignment: [settings?.alignment || 'center'],
      blogDisplayMode: [settings?.displayMode || 'grid'],
      blogShowCta: [settings?.showCta ?? true],
      blogCtaText: [getLocalizedValue(settings?.ctaText, 'en') || ''],
      blogCtaLink: [settings?.ctaLink || '/shop'],
      blogPosts: fb.array(
        (settings?.blogPosts || []).map((item: any) =>
          fb.group({
            title: [getLocalizedValue(item.title, 'en'), Validators.required],
            excerpt: [getLocalizedValue(item.excerpt, 'en')],
            image: [item.image || ''],
            date: [item.date || ''],
            author: [item.author || ''],
            category: [item.category || ''],
            link: [item.link || '/shop'],
            isActive: [item.isActive ?? true]
          })
        )
      ),
      newsletterPlaceholder: [getLocalizedValue(settings?.placeholder, 'en') || ''],
      newsletterButtonText: [getLocalizedValue(settings?.buttonText, 'en') || 'Subscribe'],
      // Footer specific
      social: fb.group({
        instagram: [settings?.social?.instagram || ''],
        facebook: [settings?.social?.facebook || ''],
        twitter: [settings?.social?.twitter || ''],
        youtube: [settings?.social?.youtube || '']
      }),
      copyright: [settings?.copyright || ''],
      columns: fb.array(
        (settings?.columns && settings.columns.length > 0 ? settings.columns : (displayType === 'footer' ? getDefaultFooterColumns() : [])).map((col: any) => {
          let titleObj: LocalizedString;
          if (typeof col.title === 'string') {
            titleObj = { en: col.title, ru: col.title, ua: col.title };
          } else {
            titleObj = {
              en: col.title?.en || '',
              ru: col.title?.ru || '',
              ua: col.title?.ua || ''
            };
          }
          return fb.group({
            title: fb.group({
              en: [titleObj.en],
              ru: [titleObj.ru],
              ua: [titleObj.ua]
            }),
            links: fb.array((col.links || []).map((link: any) => {
              let labelObj: LocalizedString;
              if (typeof link.label === 'string') {
                labelObj = { en: link.label, ru: link.label, ua: link.label };
              } else {
                labelObj = {
                  en: link.label?.en || '',
                  ru: link.label?.ru || '',
                  ua: link.label?.ua || ''
                };
              }
              return fb.group({
                label: fb.group({
                  en: [labelObj.en],
                  ru: [labelObj.ru],
                  ua: [labelObj.ua]
                }),
                url: [link.url || '', Validators.required]
              });
            }))
          });
        })
      )
    });
}
