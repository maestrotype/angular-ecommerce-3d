import { CreateSectionDto } from '../../models/section.model';
import { LocalizedString } from '../../../shared/models/localized-string.model';

const L = (en: string, ru: string, ua: string): LocalizedString => ({ en, ru, ua });

export interface SectionPresetFormPatch {
  title_en?: string;
  title_ru?: string;
  title_ua?: string;
  subtitle_en?: string;
  subtitle_ru?: string;
  subtitle_ua?: string;
  content_en?: string;
  content_ru?: string;
  content_ua?: string;
  imageUrl?: string;
  logoUrl?: string;
  showSearch?: boolean;
  showCart?: boolean;
  showProfile?: boolean;
  showImage?: boolean;
  show3d?: boolean;
  model3dUrl?: string;
  variant?: string;
  anchorId?: string;
  newsletterPlaceholder?: string;
  newsletterButtonText?: string;
  copyright?: string;
  social?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    youtube?: string;
  };
  menu?: Array<{
    title: LocalizedString;
    url: string;
    access: 'all' | 'admin' | 'closed';
    isActive: boolean;
  }>;
  categories?: Array<{
    name: string;
    slug: string;
    icon: string;
    isActive: boolean;
  }>;
  brands?: Array<{
    name: string;
    logo: string;
    isActive: boolean;
  }>;
  testimonials?: Array<{
    name: string;
    role: string;
    text: string;
    avatar: string;
    rating: number;
    isActive: boolean;
  }>;
  features?: Array<{
    icon: string;
    title: string;
    description: string;
    isActive: boolean;
  }>;
  faqItems?: Array<{
    question: string;
    answer: string;
    isActive: boolean;
  }>;
  stats?: Array<{
    value: string;
    label: string;
    suffix: string;
    isActive: boolean;
  }>;
  carouselSource?: 'new' | 'best-sellers' | 'special' | 'all';
  carouselLimit?: number;
  carouselAutoplay?: boolean;
  lookbookSlides?: Array<{
    image: string;
    title: string;
    subtitle: string;
    ctaLabel: string;
    ctaUrl: string;
    isActive: boolean;
  }>;
  videoUrl?: string;
  videoAutoplay?: boolean;
  videoCtaText?: string;
  videoCtaLink?: string;
  videoSecondaryCtaText?: string;
  videoSecondaryCtaLink?: string;
  blogDisplayMode?: 'grid' | 'list';
  blogShowCta?: boolean;
  blogCtaText?: string;
  blogCtaLink?: string;
  blogPosts?: Array<{
    title: string;
    excerpt: string;
    image: string;
    date: string;
    author: string;
    category: string;
    link: string;
    isActive: boolean;
  }>;
  columns?: Array<{
    title: LocalizedString;
    linkSource: 'manual' | 'shop-categories';
    links: Array<{ label: LocalizedString; url: string }>;
  }>;
}

const HEADER_PRESET: SectionPresetFormPatch = {
  logoUrl: 'assets/icons/logo.svg',
  showSearch: true,
  showCart: true,
  showProfile: true,
  variant: 'default',
  menu: [
    { title: L('Home', 'Главная', 'Головна'), url: '/home', access: 'all', isActive: true },
    { title: L('Shop', 'Магазин', 'Магазин'), url: '/shop', access: 'all', isActive: true },
    { title: L('About', 'О нас', 'Про нас'), url: '/about', access: 'all', isActive: true },
    { title: L('Contacts', 'Контакты', 'Контакти'), url: '/contacts', access: 'all', isActive: true }
  ]
};

const HERO_PRESET: SectionPresetFormPatch = {
  title_en: 'Discover Your',
  title_ru: 'Откройте свой',
  title_ua: 'Відкрийте свій',
  subtitle_en: 'New Style',
  subtitle_ru: 'Новый стиль',
  subtitle_ua: 'Новий стиль',
  content_en: 'Explore our latest interactive 3D collection.',
  content_ru: 'Исследуйте нашу новую интерактивную 3D-коллекцию.',
  content_ua: 'Досліджуйте нашу нову інтерактивну 3D-колекцію.',
  imageUrl: 'assets/demo/products/sneaker.svg',
  showImage: true,
  show3d: false,
  variant: 'default',
  anchorId: 'hero'
};

const PRODUCT_CAROUSEL_PRESET: SectionPresetFormPatch = {
  title_en: 'New This Season',
  title_ru: 'Новинки сезона',
  title_ua: 'Новинки сезону',
  subtitle_en: 'Just landed',
  subtitle_ru: 'Только поступили',
  subtitle_ua: 'Щойно надійшли',
  variant: 'default',
  anchorId: 'product-carousel',
  carouselSource: 'new',
  carouselLimit: 8,
  carouselAutoplay: true
};

const LOOKBOOK_PRESET: SectionPresetFormPatch = {
  title_en: 'Lookbook',
  title_ru: 'Лукбук',
  title_ua: 'Лукбук',
  subtitle_en: 'Campaign',
  subtitle_ru: 'Кампания',
  subtitle_ua: 'Кампанія',
  variant: 'default',
  anchorId: 'lookbook',
  lookbookSlides: [
    {
      image: 'assets/demo/products/sneaker.svg',
      title: 'Spring Drop',
      subtitle: 'Sculpted silhouettes in motion.',
      ctaLabel: 'Shop the look',
      ctaUrl: '/shop',
      isActive: true
    },
    {
      image: 'assets/demo/products/headphones.svg',
      title: 'Sound in 3D',
      subtitle: 'Hear the collection before you buy.',
      ctaLabel: 'Explore audio',
      ctaUrl: '/shop',
      isActive: true
    },
    {
      image: 'assets/demo/products/t-shirt.svg',
      title: 'Essentials',
      subtitle: 'Quiet luxury, everyday wear.',
      ctaLabel: 'See pieces',
      ctaUrl: '/shop',
      isActive: true
    }
  ]
};

const BEST_SELLERS_PRESET: SectionPresetFormPatch = {
  title_en: 'Best Sellers',
  title_ru: 'Хиты продаж',
  title_ua: 'Хіти продажу',
  subtitle_en: 'Top Products',
  subtitle_ru: 'Топ товаров',
  subtitle_ua: 'Топ товарів',
  variant: 'default',
  anchorId: 'best-sellers'
};

const CATEGORIES_PRESET: SectionPresetFormPatch = {
  title_en: 'Shop by Category',
  title_ru: 'Покупки по категориям',
  title_ua: 'Покупки за категоріями',
  subtitle_en: 'Browse Collections',
  subtitle_ru: 'Смотреть коллекции',
  subtitle_ua: 'Переглянути колекції',
  variant: 'default',
  anchorId: 'categories',
  categories: [
    { name: 'Footwear', slug: 'footwear', icon: 'assets/icons/clothing.svg', isActive: true },
    { name: 'Electronics', slug: 'electronics', icon: 'assets/demo/products/headphones.svg', isActive: true },
    { name: 'Lifestyle', slug: 'lifestyle', icon: 'assets/icons/people.svg', isActive: true },
    { name: 'Auto', slug: 'auto', icon: 'assets/icons/auto.svg', isActive: true }
  ]
};

const BRANDS_PRESET: SectionPresetFormPatch = {
  title_en: 'Trusted by Leading Brands',
  title_ru: 'Нам доверяют лучшие бренды',
  title_ua: 'Нам довіряють найкращі бренди',
  variant: 'default',
  anchorId: 'brands',
  brands: [
    { name: 'Nike', logo: 'assets/icons/nike.svg', isActive: true },
    { name: 'Puma', logo: 'assets/icons/puma.svg', isActive: true },
    { name: 'Under Armour', logo: 'assets/icons/under-armour.svg', isActive: true },
    { name: 'Reebok', logo: 'assets/icons/reebok.svg', isActive: true }
  ]
};

const TESTIMONIALS_PRESET: SectionPresetFormPatch = {
  title_en: 'What Our Customers Say',
  title_ru: 'Что говорят наши клиенты',
  title_ua: 'Що кажуть наші клієнти',
  subtitle_en: 'Real Reviews',
  subtitle_ru: 'Настоящие отзывы',
  subtitle_ua: 'Справжні відгуки',
  anchorId: 'testimonials',
  testimonials: [
    {
      name: 'Sarah Johnson',
      role: 'Verified Buyer',
      text: 'Amazing quality and fast delivery. The 3D preview helped me pick the perfect product.',
      avatar: 'assets/demo/products/headphones.svg',
      rating: 5,
      isActive: true
    },
    {
      name: 'Michael Chen',
      role: 'Premium Member',
      text: 'Best shopping experience I have had online. Clean design and smooth checkout.',
      avatar: 'assets/demo/products/travel-mug.svg',
      rating: 5,
      isActive: true
    },
    {
      name: 'Emma Wilson',
      role: 'Returning Customer',
      text: 'Love the product range and the responsive support team.',
      avatar: 'assets/demo/products/yoga-mat.svg',
      rating: 4,
      isActive: true
    }
  ]
};

const NEWSLETTER_PRESET: SectionPresetFormPatch = {
  title_en: 'Stay in the Loop',
  title_ru: 'Будьте в курсе',
  title_ua: 'Будьте в курсі',
  subtitle_en: 'Get exclusive offers',
  subtitle_ru: 'Получайте эксклюзивные предложения',
  subtitle_ua: 'Отримуйте ексклюзивні пропозиції',
  content_en: 'Subscribe for new arrivals, promotions, and style tips.',
  content_ru: 'Подпишитесь на новинки, акции и советы по стилю.',
  content_ua: 'Підпишіться на новинки, акції та поради щодо стилю.',
  newsletterPlaceholder: 'Enter your email',
  newsletterButtonText: 'Subscribe',
  anchorId: 'newsletter'
};

const FEATURES_PRESET: SectionPresetFormPatch = {
  title_en: 'Why Choose Us',
  title_ru: 'Почему выбирают нас',
  title_ua: 'Чому обирають нас',
  subtitle_en: 'Built for modern commerce',
  subtitle_ru: 'Создано для современной коммерции',
  subtitle_ua: 'Створено для сучасної комерції',
  anchorId: 'features',
  features: [
    { icon: 'local_shipping', title: 'Fast Shipping', description: 'Free delivery on orders over $50.', isActive: true },
    { icon: 'verified', title: 'Quality Guaranteed', description: 'Premium products backed by our promise.', isActive: true },
    { icon: 'support_agent', title: '24/7 Support', description: 'Friendly help whenever you need it.', isActive: true },
    { icon: 'view_in_ar', title: '3D Preview', description: 'Explore products in interactive 3D.', isActive: true }
  ]
};

const FAQ_PRESET: SectionPresetFormPatch = {
  title_en: 'Frequently Asked Questions',
  title_ru: 'Часто задаваемые вопросы',
  title_ua: 'Часті запитання',
  anchorId: 'faq',
  faqItems: [
    {
      question: 'How do I place an order?',
      answer: 'Add items to your cart, proceed to checkout, and complete payment. You will receive a confirmation email.',
      isActive: true
    },
    {
      question: 'What is your return policy?',
      answer: 'Returns are accepted within 30 days of delivery for unused items in original packaging.',
      isActive: true
    },
    {
      question: 'Do you ship internationally?',
      answer: 'Yes, we ship to most countries. Shipping rates are calculated at checkout.',
      isActive: true
    }
  ]
};

const STATS_PRESET: SectionPresetFormPatch = {
  title_en: 'Our Impact in Numbers',
  title_ru: 'Наши результаты в цифрах',
  title_ua: 'Наші результати в цифрах',
  anchorId: 'stats',
  stats: [
    { value: '12000', label: 'Happy Customers', suffix: '+', isActive: true },
    { value: '350', label: 'Products', suffix: '+', isActive: true },
    { value: '99', label: 'Satisfaction Rate', suffix: '%', isActive: true },
    { value: '24', label: 'Support', suffix: '/7', isActive: true }
  ]
};

const FOOTER_PRESET: SectionPresetFormPatch = {
  copyright: '© 2026 Angular Ecommerce 3D. All rights reserved.',
  social: {
    instagram: 'https://instagram.com',
    facebook: 'https://facebook.com',
    twitter: 'https://twitter.com',
    youtube: 'https://youtube.com'
  },
  columns: [
    {
      title: L('Quick Links', 'Быстрые ссылки', 'Швидкі посилання'),
      linkSource: 'manual',
      links: [
        { label: L('Home', 'Главная', 'Головна'), url: '/home' },
        { label: L('Shop', 'Магазин', 'Магазин'), url: '/shop' },
        { label: L('About', 'О нас', 'Про нас'), url: '/about' },
        { label: L('Contacts', 'Контакты', 'Контакти'), url: '/contacts' }
      ]
    },
    {
      title: L('Categories', 'Категории', 'Категорії'),
      linkSource: 'shop-categories',
      links: []
    }
  ]
};

const SPECIAL_OFFER_PRESET: SectionPresetFormPatch = {
  title_en: 'Special Offer',
  title_ru: 'Специальное предложение',
  title_ua: 'Спеціальна пропозиція',
  subtitle_en: 'Only this week: Up to 40% off',
  subtitle_ru: 'Только на этой неделе: скидки до 40%',
  subtitle_ua: 'Тільки цього тижня: знижки до 40%',
  content_en: 'Limited-time deals on selected items.',
  content_ru: 'Ограниченные предложения на выбранные товары.',
  content_ua: 'Обмежені пропозиції на обрані товари.',
  imageUrl: 'assets/demo/products/t-shirt.svg',
  showImage: true,
  anchorId: 'special-offer'
};

const HTML_CONTENT_PRESET: SectionPresetFormPatch = {
  title_en: 'About Our Store',
  title_ru: 'О нашем магазине',
  title_ua: 'Про наш магазин',
  content_en: '<p>We combine premium product curation with immersive 3D shopping experiences.</p>',
  content_ru: '<p>Мы сочетаем премиальную подборку товаров с immersive 3D-шопингом.</p>',
  content_ua: '<p>Ми поєднуємо преміальну добірку товарів з immersive 3D-шопінгом.</p>'
};

const VIDEO_HERO_PRESET: SectionPresetFormPatch = {
  title_en: 'Move in 3D',
  title_ru: 'Движение в 3D',
  title_ua: 'Рух у 3D',
  subtitle_en: 'Campaign film',
  subtitle_ru: 'Фильм кампании',
  subtitle_ua: 'Фільм кампанії',
  content_en: 'A cinematic look at this season’s silhouettes, textures, and sound.',
  content_ru: 'Кинематографичный взгляд на силуэты, текстуры и звук этого сезона.',
  content_ua: 'Кінематографічний погляд на силуети, текстури та звук цього сезону.',
  imageUrl: 'assets/demo/products/sneaker.svg',
  showImage: true,
  variant: 'default',
  anchorId: 'video-hero',
  videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
  videoAutoplay: true,
  videoCtaText: 'Shop the film',
  videoCtaLink: '/shop',
  videoSecondaryCtaText: 'Our story',
  videoSecondaryCtaLink: '/about'
};

const BLOG_POSTS_PRESET: SectionPresetFormPatch = {
  title_en: 'From the Journal',
  title_ru: 'Из журнала',
  title_ua: 'З журналу',
  subtitle_en: 'Stories & style notes',
  subtitle_ru: 'Истории и заметки о стиле',
  subtitle_ua: 'Історії та нотатки про стиль',
  content_en: 'Editorial notes on materials, 3D fitting, and how we build each drop.',
  content_ru: 'Редакторские заметки о материалах, 3D-примерке и том, как мы собираем дропы.',
  content_ua: 'Редакторські нотатки про матеріали, 3D-примірку і те, як ми збираємо дропи.',
  variant: 'default',
  anchorId: 'blog',
  blogDisplayMode: 'grid',
  blogShowCta: true,
  blogCtaText: 'View all stories',
  blogCtaLink: '/shop',
  blogPosts: [
    {
      title: 'How 3D fitting changed our studio',
      excerpt: 'A look at the tools we use before a sample ever hits the floor.',
      image: 'assets/demo/products/sneaker.svg',
      date: '2026-03-12',
      author: 'Maya Cole',
      category: 'Studio',
      link: '/shop',
      isActive: true
    },
    {
      title: 'Sound, space, and the next drop',
      excerpt: 'Why we treat audio products like sculpture — and how to listen in 3D.',
      image: 'assets/demo/products/headphones.svg',
      date: '2026-04-02',
      author: 'Leo Hart',
      category: 'Audio',
      link: '/shop',
      isActive: true
    },
    {
      title: 'Quiet luxury, everyday knits',
      excerpt: 'Fabric notes from the essentials capsule: weight, drape, and wash care.',
      image: 'assets/demo/products/t-shirt.svg',
      date: '2026-04-18',
      author: 'Elena Voss',
      category: 'Apparel',
      link: '/shop',
      isActive: true
    }
  ]
};

const CONTACTS_PRESET: SectionPresetFormPatch = {
  title_en: 'Get in Touch',
  title_ru: 'Свяжитесь с нами',
  title_ua: 'Зв’яжіться з нами',
  subtitle_en: 'We reply within one business day.',
  subtitle_ru: 'Отвечаем в течение одного рабочего дня.',
  subtitle_ua: 'Відповідаємо протягом одного робочого дня.',
  content_en: 'Questions about orders, 3D previews, or wholesale? Send a note.',
  content_ru: 'Вопросы по заказам, 3D-превью или опту? Напишите нам.',
  content_ua: 'Питання щодо замовлень, 3D-прев’ю чи опту? Напишіть нам.',
  anchorId: 'contacts'
};

const ABOUT_PRESET: SectionPresetFormPatch = {
  title_en: 'Crafted for',
  title_ru: 'Создано для',
  title_ua: 'Створено для',
  subtitle_en: 'A 3D-first studio for modern essentials.',
  subtitle_ru: '3D-студия современных базовых вещей.',
  subtitle_ua: '3D-студія сучасних базових речей.',
  content_en: 'the 3D era',
  content_ru: 'эпохи 3D',
  content_ua: 'епохи 3D',
  imageUrl: 'assets/demo/products/sneaker.svg',
  showImage: true,
  show3d: false,
  anchorId: 'about'
};

const PRODUCT_TABS_PRESET: SectionPresetFormPatch = {
  title_en: 'Product Details',
  title_ru: 'О товаре',
  title_ua: 'Про товар',
  anchorId: 'product-tabs'
};

const SIMILAR_PRODUCTS_PRESET: SectionPresetFormPatch = {
  title_en: 'You May Also Like',
  title_ru: 'Вам также может понравиться',
  title_ua: 'Вам також може сподобатися',
  anchorId: 'similar-products'
};

const BOUGHT_TOGETHER_PRESET: SectionPresetFormPatch = {
  title_en: 'Frequently Bought Together',
  title_ru: 'С этим часто покупают',
  title_ua: 'З цим часто купують',
  anchorId: 'bought-together'
};

const PRESET_MAP: Record<string, SectionPresetFormPatch> = {
  header: HEADER_PRESET,
  hero: HERO_PRESET,
  'hero-glass': { ...HERO_PRESET, variant: 'glass' },
  'best-sellers': BEST_SELLERS_PRESET,
  'product-carousel': PRODUCT_CAROUSEL_PRESET,
  lookbook: LOOKBOOK_PRESET,
  'video-hero': VIDEO_HERO_PRESET,
  'blog-posts': BLOG_POSTS_PRESET,
  categories: CATEGORIES_PRESET,
  brands: BRANDS_PRESET,
  testimonials: TESTIMONIALS_PRESET,
  newsletter: NEWSLETTER_PRESET,
  'features-grid': FEATURES_PRESET,
  faq: FAQ_PRESET,
  stats: STATS_PRESET,
  footer: FOOTER_PRESET,
  'special-offer': SPECIAL_OFFER_PRESET,
  'html-content': HTML_CONTENT_PRESET,
  contacts: CONTACTS_PRESET,
  about: ABOUT_PRESET,
  'product-tabs': PRODUCT_TABS_PRESET,
  'similar-products': SIMILAR_PRODUCTS_PRESET,
  'bought-together': BOUGHT_TOGETHER_PRESET
};

export function getSectionPreset(type: string): SectionPresetFormPatch | null {
  return PRESET_MAP[type] ? { ...PRESET_MAP[type] } : null;
}

function toCreateDto(
  type: string,
  preset: SectionPresetFormPatch,
  pageTarget: string,
  order?: number
): CreateSectionDto {
  const dto: CreateSectionDto = {
    type,
    title: preset.title_en
      ? L(preset.title_en, preset.title_ru || preset.title_en, preset.title_ua || preset.title_en)
      : L('Section', 'Секция', 'Секція'),
    subtitle: preset.subtitle_en
      ? L(preset.subtitle_en, preset.subtitle_ru || preset.subtitle_en, preset.subtitle_ua || preset.subtitle_en)
      : undefined,
    content: preset.content_en
      ? L(preset.content_en, preset.content_ru || preset.content_en, preset.content_ua || preset.content_en)
      : undefined,
    imageUrl: preset.imageUrl,
    model3dUrl: preset.model3dUrl,
    show3d: preset.show3d ?? false,
    showImage: preset.showImage ?? true,
    isActive: true,
    pageTarget,
    variant: preset.variant || 'default',
    anchorId: preset.anchorId,
    order,
    settings: buildSettingsFromPreset(type, preset)
  };

  return dto;
}

function buildSettingsFromPreset(type: string, preset: SectionPresetFormPatch): Record<string, any> {
  if (type === 'header') {
    return {
      logoUrl: preset.logoUrl,
      showSearch: preset.showSearch,
      showCart: preset.showCart,
      showProfile: preset.showProfile,
      menu: preset.menu
    };
  }

  if (type === 'categories') {
    return {
      categories: (preset.categories || []).map(cat => ({
        ...cat,
        name: L(cat.name, cat.name, cat.name)
      }))
    };
  }

  if (type === 'brands') {
    return {
      brands: (preset.brands || []).map(brand => ({
        ...brand,
        name: L(brand.name, brand.name, brand.name)
      }))
    };
  }

  if (type === 'testimonials') {
    return {
      testimonials: (preset.testimonials || []).map(item => ({
        ...item,
        name: L(item.name, item.name, item.name),
        role: L(item.role, item.role, item.role),
        text: L(item.text, item.text, item.text)
      }))
    };
  }

  if (type === 'features-grid') {
    return {
      features: (preset.features || []).map(item => ({
        ...item,
        title: L(item.title, item.title, item.title),
        description: L(item.description, item.description, item.description)
      }))
    };
  }

  if (type === 'faq') {
    return {
      items: (preset.faqItems || []).map(item => ({
        ...item,
        question: L(item.question, item.question, item.question),
        answer: L(item.answer, item.answer, item.answer)
      }))
    };
  }

  if (type === 'stats') {
    return {
      stats: (preset.stats || []).map(item => ({
        ...item,
        label: L(item.label, item.label, item.label)
      }))
    };
  }

  if (type === 'product-carousel') {
    return {
      source: preset.carouselSource || 'new',
      limit: preset.carouselLimit ?? 8,
      autoplay: preset.carouselAutoplay !== false
    };
  }

  if (type === 'lookbook') {
    return {
      autoplay: true,
      slides: (preset.lookbookSlides || []).map(slide => ({
        ...slide,
        title: L(slide.title, slide.title, slide.title),
        subtitle: L(slide.subtitle, slide.subtitle, slide.subtitle),
        ctaLabel: L(slide.ctaLabel, slide.ctaLabel, slide.ctaLabel)
      }))
    };
  }

  if (type === 'video-hero') {
    return {
      videoUrl: preset.videoUrl || '',
      posterImage: preset.imageUrl || '',
      autoplay: preset.videoAutoplay !== false,
      muted: true,
      loop: true,
      controls: false,
      overlayOpacity: 0.5,
      alignment: 'center',
      showPlayButton: true,
      ctaText: L(
        preset.videoCtaText || 'Shop now',
        preset.videoCtaText || 'В магазин',
        preset.videoCtaText || 'До магазину'
      ),
      ctaLink: preset.videoCtaLink || '/shop',
      secondaryCtaText: L(
        preset.videoSecondaryCtaText || 'Learn more',
        preset.videoSecondaryCtaText || 'Подробнее',
        preset.videoSecondaryCtaText || 'Детальніше'
      ),
      secondaryCtaLink: preset.videoSecondaryCtaLink || '/about'
    };
  }

  if (type === 'blog-posts') {
    return {
      displayMode: preset.blogDisplayMode || 'grid',
      showCta: preset.blogShowCta !== false,
      ctaText: L(
        preset.blogCtaText || 'View all stories',
        'Все материалы',
        'Усі матеріали'
      ),
      ctaLink: preset.blogCtaLink || '/shop',
      blogPosts: (preset.blogPosts || []).map(post => ({
        ...post,
        title: L(post.title, post.title, post.title),
        excerpt: L(post.excerpt, post.excerpt, post.excerpt)
      }))
    };
  }

  if (type === 'about') {
    return {
      subtitle: preset.subtitle_en
        ? L(preset.subtitle_en, preset.subtitle_ru || preset.subtitle_en, preset.subtitle_ua || preset.subtitle_en)
        : undefined
    };
  }

  if (type === 'newsletter') {
    return {
      placeholder: L(
        preset.newsletterPlaceholder || 'Enter your email',
        'Введите email',
        'Введіть email'
      ),
      buttonText: L(
        preset.newsletterButtonText || 'Subscribe',
        'Подписаться',
        'Підписатися'
      )
    };
  }

  if (type === 'footer') {
    return {
      copyright: preset.copyright,
      social: preset.social,
      columns: preset.columns
    };
  }

  return {};
}

export interface HomepageWizardSection {
  type: string;
  pageTarget: string;
  preset: SectionPresetFormPatch;
}

export const HOMEPAGE_WIZARD_SECTIONS: HomepageWizardSection[] = [
  { type: 'header', pageTarget: 'global', preset: HEADER_PRESET },
  { type: 'hero', pageTarget: 'home', preset: HERO_PRESET },
  { type: 'best-sellers', pageTarget: 'home', preset: BEST_SELLERS_PRESET },
  { type: 'categories', pageTarget: 'home', preset: CATEGORIES_PRESET },
  { type: 'footer', pageTarget: 'global', preset: FOOTER_PRESET }
];

export function buildHomepageWizardDtos(startOrder: number): CreateSectionDto[] {
  return HOMEPAGE_WIZARD_SECTIONS.map((entry, index) =>
    toCreateDto(entry.type, entry.preset, entry.pageTarget, startOrder + index + 1)
  );
}

export function buildMissingHomepageWizardDtos(
  existingSections: Array<{ type: string; pageTarget?: string }>
): CreateSectionDto[] {
  const maxOrder = existingSections.reduce((max, section) => Math.max(max, (section as any).order || 0), 0);
  const missingEntries = HOMEPAGE_WIZARD_SECTIONS.filter(entry => !wizardSectionExists(existingSections, entry));

  return missingEntries.map((entry, index) =>
    toCreateDto(entry.type, entry.preset, entry.pageTarget, maxOrder + index + 1)
  );
}

export function buildSectionDtoFromPreset(
  type: string,
  preset: SectionPresetFormPatch,
  pageTarget: string,
  order?: number
): CreateSectionDto {
  return toCreateDto(type, preset, pageTarget, order);
}

export function wizardSectionExists(
  existingSections: Array<{ type: string; pageTarget?: string }>,
  entry: HomepageWizardSection
): boolean {
  if (entry.type === 'header' || entry.type === 'footer') {
    return existingSections.some(section => section.type === entry.type);
  }

  return existingSections.some(
    section => section.type === entry.type && section.pageTarget === entry.pageTarget
  );
}
