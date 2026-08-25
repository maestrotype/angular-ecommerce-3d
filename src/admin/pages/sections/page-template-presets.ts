import { CreateSectionDto } from '../../models/section.model';
import { PageTemplate } from 'src/shared/models/page.model';
import { buildSectionDtoFromPreset, getSectionPreset } from './section-presets';

export type PageTemplatePresetId = 'landing-page' | 'faq-page' | 'collection-page' | 'brand-page';

export const PAGE_TEMPLATE_PRESET_IDS: PageTemplatePresetId[] = [
  'landing-page',
  'faq-page',
  'collection-page',
  'brand-page'
];

const PAGE_TEMPLATE_BLUEPRINTS: Record<PageTemplatePresetId, string[]> = {
  'landing-page': ['hero', 'features-grid', 'testimonials', 'stats', 'newsletter'],
  'faq-page': ['hero', 'faq'],
  'collection-page': ['hero', 'categories', 'product-carousel', 'lookbook'],
  'brand-page': ['hero', 'brands', 'special-offer']
};

export function isPageTemplatePreset(template: string): template is PageTemplatePresetId {
  return PAGE_TEMPLATE_PRESET_IDS.includes(template as PageTemplatePresetId);
}

export function buildPageTemplateSections(
  pageTarget: string,
  template: PageTemplatePresetId,
  startOrder: number
): CreateSectionDto[] {
  const types = PAGE_TEMPLATE_BLUEPRINTS[template];

  return types.map((type, index) => {
    const preset = getSectionPreset(type);
    if (!preset) {
      throw new Error(`Missing section preset for type "${type}"`);
    }
    return buildSectionDtoFromPreset(type, preset, pageTarget, startOrder + index + 1);
  });
}

export function buildMissingPageTemplateSections(
  pageTarget: string,
  template: PageTemplatePresetId,
  existingSections: Array<{ type: string; pageTarget?: string }>
): CreateSectionDto[] {
  const maxOrder = existingSections.reduce((max, section) => Math.max(max, (section as any).order || 0), 0);
  const types = PAGE_TEMPLATE_BLUEPRINTS[template].filter(type =>
    !existingSections.some(section => section.type === type && section.pageTarget === pageTarget)
  );

  return types.map((type, index) => {
    const preset = getSectionPreset(type)!;
    return buildSectionDtoFromPreset(type, preset, pageTarget, maxOrder + index + 1);
  });
}

export function getSuggestedSlugForTemplate(template: PageTemplate): string {
  switch (template) {
    case 'landing-page':
      return 'landing';
    case 'faq-page':
      return 'faq';
    case 'collection-page':
      return 'collection';
    case 'brand-page':
      return 'brands';
    case 'contact':
      return 'contact';
    case 'simple':
      return 'help-center';
    default:
      return '';
  }
}

export interface PageDemoFormPatch {
  slug?: string;
  title_en: string;
  title_ru: string;
  title_ua: string;
  content_en?: string;
  content_ru?: string;
  content_ua?: string;
  seoDescription_en: string;
  seoDescription_ru: string;
  seoDescription_ua: string;
}

export function getPageDemoPatch(template: PageTemplate): PageDemoFormPatch {
  switch (template) {
    case 'landing-page':
      return {
        slug: 'landing',
        title_en: 'Spring Campaign',
        title_ru: 'Весенняя кампания',
        title_ua: 'Весняна кампанія',
        seoDescription_en: 'Discover the new season: 3D fittings, quiet luxury, and limited drops.',
        seoDescription_ru: 'Новый сезон: 3D-примерка, тихая роскошь и лимитированные дропы.',
        seoDescription_ua: 'Новий сезон: 3D-примірка, тиха розкіш і лімітовані дропи.'
      };
    case 'faq-page':
      return {
        slug: 'faq',
        title_en: 'Frequently Asked Questions',
        title_ru: 'Часто задаваемые вопросы',
        title_ua: 'Часті запитання',
        seoDescription_en: 'Shipping, returns, 3D preview, and payment answers in one place.',
        seoDescription_ru: 'Доставка, возвраты, 3D-превью и оплата — ответы в одном месте.',
        seoDescription_ua: 'Доставка, повернення, 3D-прев’ю та оплата — відповіді в одному місці.'
      };
    case 'collection-page':
      return {
        slug: 'collection',
        title_en: 'Spring Collection',
        title_ru: 'Весенняя коллекция',
        title_ua: 'Весняна колекція',
        seoDescription_en: 'Shop the lookbook: new arrivals, categories, and campaign edits.',
        seoDescription_ru: 'Смотрите лукбук: новинки, категории и кампании.',
        seoDescription_ua: 'Дивіться лукбук: новинки, категорії та кампанії.'
      };
    case 'brand-page':
      return {
        slug: 'brands',
        title_en: 'Our Brands',
        title_ru: 'Наши бренды',
        title_ua: 'Наші бренди',
        seoDescription_en: 'Partners and houses we stock, plus this week’s featured offer.',
        seoDescription_ru: 'Партнёры и дома, которые мы представляем, плюс предложение недели.',
        seoDescription_ua: 'Партнери та будинки, які ми представляємо, плюс пропозиція тижня.'
      };
    case 'contact':
      return {
        slug: 'contact',
        title_en: 'Contact Us',
        title_ru: 'Контакты',
        title_ua: 'Контакти',
        seoDescription_en: 'Reach the studio about orders, wholesale, and 3D product previews.',
        seoDescription_ru: 'Свяжитесь со студией по заказам, опту и 3D-превью товаров.',
        seoDescription_ua: 'Зв’яжіться зі студією щодо замовлень, опту та 3D-прев’ю товарів.'
      };
    case 'sections':
      return {
        slug: 'story',
        title_en: 'Our Story',
        title_ru: 'Наша история',
        title_ua: 'Наша історія',
        seoDescription_en: 'A custom section page you can fill with hero, journal, and campaign blocks.',
        seoDescription_ru: 'Страница из секций: hero, журнал и кампании.',
        seoDescription_ua: 'Сторінка з секцій: hero, журнал і кампанії.'
      };
    default:
      return {
        slug: 'help-center',
        title_en: 'Help Center',
        title_ru: 'Центр помощи',
        title_ua: 'Центр допомоги',
        content_en:
          '<h2>Shipping</h2><p>Orders ship within 2 business days. Tracking is emailed as soon as the parcel leaves the studio.</p><h2>Returns</h2><p>Unused items can be returned within 30 days in original packaging.</p>',
        content_ru:
          '<h2>Доставка</h2><p>Заказы отправляем в течение 2 рабочих дней. Трек приходит на email, как только посылка покидает студию.</p><h2>Возврат</h2><p>Неиспользованные товары можно вернуть в течение 30 дней в оригинальной упаковке.</p>',
        content_ua:
          '<h2>Доставка</h2><p>Замовлення відправляємо протягом 2 робочих днів. Трек надходить на email, щойно посилка залишає студію.</p><h2>Повернення</h2><p>Невикористані товари можна повернути протягом 30 днів в оригінальній упаковці.</p>',
        seoDescription_en: 'Shipping, returns, and order help for the 3D store.',
        seoDescription_ru: 'Доставка, возвраты и помощь по заказам 3D-магазина.',
        seoDescription_ua: 'Доставка, повернення та допомога із замовленнями 3D-магазину.'
      };
  }
}
