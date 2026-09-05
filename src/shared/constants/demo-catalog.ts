import { Category } from '../models/category.model';
import { Product } from '../models/product.model';
import { Section } from '../models/section.model';
import { DEMO_BAG_GLB, DEMO_SHOES_GLB } from './demo-model-paths';

const L = (en: string, ru: string, ua: string) => ({ en, ru, ua });

/** Negative IDs — never collide with real DB rows. */
export const DEMO_PRODUCTS: Product[] = [
  {
    id: -901,
    isDemo: true,
    name: L('Saddle Crossbody', 'Седельная сумка', 'Сідельна сумка'),
    category: 'bags',
    price: 189,
    stock: 24,
    description: L(
      'Structured crossbody with a bundled 3D model — orbit it on the homepage stage.',
      'Структурированная сумка с 3D-моделью — крутите на витрине главной.',
      'Структурована сумка з 3D-моделлю — обертайте на вітрині головної.',
    ),
    imageUrl: 'assets/demo/products/bag.png',
    model3dUrl: DEMO_BAG_GLB,
    isSpecial: true,
    rating: 4.7,
    features: ['3D Product View', 'Adjustable Strap'],
    specifications: { material: 'Grain leather', color: 'Sand' },
  },
  {
    id: -902,
    isDemo: true,
    name: L('Weekend Tote', 'Шопер Weekend', 'Шопер Weekend'),
    category: 'bags',
    price: 149,
    stock: 30,
    description: L(
      'Open tote for daily carry with the same demo 3D asset.',
      'Открытый шопер на каждый день с демо-3D моделью.',
      'Відкритий шопер на щодень з демо-3D моделлю.',
    ),
    imageUrl: 'assets/demo/products/bag.png',
    model3dUrl: DEMO_BAG_GLB,
    rating: 4.5,
    features: ['3D Product View', 'Wide Opening'],
    specifications: { material: 'Canvas + leather', volume: '18 L' },
  },
  {
    id: -903,
    isDemo: true,
    name: L('Organic Cotton T-Shirt', 'Футболка из органического хлопка', 'Футболка з органічної бавовни'),
    category: 'clothing',
    price: 24.99,
    stock: 100,
    description: L(
      'Comfortable organic cotton t-shirt in a regular fit.',
      'Футболка из органического хлопка свободного кроя.',
      'Футболка з органічної бавовни вільного крою.',
    ),
    imageUrl: 'assets/demo/products/tshirt.png',
    rating: 4.2,
    features: ['Organic Material', 'Comfortable Fit'],
    specifications: { material: '100% Organic Cotton', fit: 'Regular' },
  },
  {
    id: -904,
    isDemo: true,
    name: L('Court Runner', 'Кроссовки Court Runner', 'Кросівки Court Runner'),
    category: 'shoes',
    price: 129.99,
    stock: 40,
    description: L(
      'Court sneaker with a bundled demo 3D model.',
      'Кроссовки с демо-3D-моделью.',
      'Кросівки з демо-3D моделлю.',
    ),
    imageUrl: 'assets/demo/products/sneaker.png',
    model3dUrl: DEMO_SHOES_GLB,
    isSpecial: true,
    rating: 4.7,
    features: ['3D Product View', 'Lightweight Sole'],
    specifications: { material: 'Mesh + Rubber', sizes: 'EU 38–46' },
  },
  {
    id: -905,
    isDemo: true,
    name: L('City Loafer', 'Лоферы City', 'Лофери City'),
    category: 'shoes',
    price: 159,
    stock: 22,
    description: L(
      'Slip-on loafer with catalog-linked 3D on the homepage stage.',
      'Лоферы без шнуровки с 3D на витрине.',
      'Лофери без шнурівки з 3D на вітрині.',
    ),
    imageUrl: 'assets/demo/products/sneaker.png',
    model3dUrl: DEMO_SHOES_GLB,
    rating: 4.4,
    features: ['3D Product View', 'Slip-on'],
    specifications: { material: 'Smooth leather', sizes: 'EU 39–45' },
  },
  {
    id: -906,
    isDemo: true,
    name: L('Wireless Bluetooth Headphones', 'Беспроводные наушники', 'Бездротові навушники'),
    category: 'electronics',
    price: 99.99,
    stock: 50,
    description: L(
      'High-quality wireless headphones with noise cancellation.',
      'Беспроводные наушники с шумоподавлением.',
      'Бездротові навушники з шумоподавленням.',
    ),
    imageUrl: 'assets/demo/products/headphones.svg',
    isSpecial: true,
    rating: 4.5,
    features: ['Noise Cancellation', '30h Battery'],
    specifications: { connectivity: 'Bluetooth 5.0' },
  },
  {
    id: -907,
    isDemo: true,
    name: L('Professional Yoga Mat', 'Коврик для йоги', 'Килимок для йоги'),
    category: 'sports',
    price: 79.99,
    stock: 30,
    description: L(
      'Non-slip yoga mat made from eco-friendly materials.',
      'Антискользящий коврик из экологичных материалов.',
      'Антиковзкий килимок з еко-матеріалів.',
    ),
    imageUrl: 'assets/demo/products/yoga-mat.svg',
    rating: 4.4,
    features: ['Non-Slip Surface', 'Eco-Friendly'],
    specifications: { thickness: '6mm', material: 'Natural Rubber' },
  },
  {
    id: -908,
    isDemo: true,
    name: L('Stainless Travel Mug', 'Термокружка', 'Термокружка'),
    category: 'home',
    price: 34.99,
    stock: 60,
    description: L(
      'Double-wall insulated mug keeps drinks hot for 8 hours.',
      'Термокружка с двойными стенками — держит тепло 8 часов.',
      'Термокружка з подвійними стінками — тримає тепло 8 годин.',
    ),
    imageUrl: 'assets/demo/products/travel-mug.svg',
    rating: 4.5,
    features: ['Insulated', 'Leak-proof Lid'],
    specifications: { capacity: '450ml', material: 'Stainless Steel' },
  },
];

export const DEMO_CATEGORIES: Category[] = [
  {
    id: 'demo-bags',
    name: L('Bags', 'Сумки', 'Сумки'),
    slug: 'bags',
    icon: 'assets/icons/shopping-cart.svg',
    isActive: true,
  },
  {
    id: 'demo-clothing',
    name: L('Clothing', 'Одежда', 'Одяг'),
    slug: 'clothing',
    icon: 'assets/icons/clothing.svg',
    isActive: true,
  },
  {
    id: 'demo-shoes',
    name: L('Shoes', 'Обувь', 'Взуття'),
    slug: 'shoes',
    icon: 'assets/icons/shopping-cart.svg',
    isActive: true,
  },
  {
    id: 'demo-electronics',
    name: L('Electronics', 'Электроника', 'Електроніка'),
    slug: 'electronics',
    icon: 'assets/demo/products/headphones.svg',
    isActive: true,
  },
  {
    id: 'demo-sports',
    name: L('Sports', 'Спорт', 'Спорт'),
    slug: 'sports',
    icon: 'assets/demo/products/yoga-mat.svg',
    isActive: true,
  },
  {
    id: 'demo-home',
    name: L('Home', 'Дом', 'Дім'),
    slug: 'home',
    icon: 'assets/demo/products/travel-mug.svg',
    isActive: true,
  },
];

const DEMO_HOME_SECTIONS: Section[] = [
  {
    id: -801,
    type: 'hero-glass',
    title: L('Discover Our Collection', 'Откройте коллекцию', 'Відкрийте колекцію'),
    subtitle: L('Interactive 3D Storefront', 'Интерактивная 3D-витрина', 'Інтерактивна 3D-вітрина'),
    content: L(
      'Explore fashion and lifestyle products in 3D while the store connects.',
      'Смотрите товары в 3D, пока магазин подключается.',
      'Переглядайте товари в 3D, поки магазин підключається.',
    ),
    imageUrl: 'assets/demo/products/bag.png',
    order: 1,
    isActive: true,
    pageTarget: 'home',
    variant: 'glass',
    anchorId: 'hero-glass',
    showImage: true,
    show3d: false,
  },
  {
    id: -802,
    type: 'product-stage',
    title: L('Turn it in 3D', 'Поверни в 3D', 'Поверни в 3D'),
    subtitle: L('Live catalog', 'Живой каталог', 'Живий каталог'),
    content: L(
      'Bags, clothing, and shoes — drag to orbit. Demo products until the server wakes up.',
      'Сумки, одежда и обувь — крутите модель. Демо-товары, пока сервер не проснётся.',
      'Сумки, одяг і взуття — обертайте модель. Демо-товари, поки сервер не прокинеться.',
    ),
    order: 2,
    isActive: true,
    pageTarget: 'home',
    variant: 'default',
    anchorId: 'product-stage',
    settings: {
      limit: 5,
      autoRotate: true,
      categories: ['bags', 'clothing', 'shoes'],
      productIds: [-901, -902, -903, -904, -905],
    },
  },
  {
    id: -803,
    type: 'best-sellers',
    title: L('Best Sellers', 'Хиты продаж', 'Хіти продажу'),
    subtitle: L('Top Products', 'Топ товаров', 'Топ товарів'),
    order: 3,
    isActive: true,
    pageTarget: 'home',
    variant: 'default',
    anchorId: 'best-sellers',
  },
  {
    id: -804,
    type: 'categories',
    title: L('Shop by Category', 'Покупки по категориям', 'Покупки за категоріями'),
    subtitle: L('Browse Collections', 'Смотреть коллекции', 'Переглянути колекції'),
    order: 4,
    isActive: true,
    pageTarget: 'home',
    variant: 'default',
    anchorId: 'categories',
    settings: {
      categories: [
        { name: 'Bags', slug: 'bags', icon: 'assets/icons/shopping-cart.svg', isActive: true },
        { name: 'Shoes', slug: 'shoes', icon: 'assets/icons/shopping-cart.svg', isActive: true },
        { name: 'Clothing', slug: 'clothing', icon: 'assets/icons/clothing.svg', isActive: true },
        { name: 'Electronics', slug: 'electronics', icon: 'assets/demo/products/headphones.svg', isActive: true },
      ],
    },
  },
];

export function getDemoProducts(): Product[] {
  return DEMO_PRODUCTS.map((product) => ({ ...product }));
}

export function getDemoProductById(id: number): Product | undefined {
  const match = DEMO_PRODUCTS.find((product) => product.id === id);
  return match ? { ...match } : undefined;
}

export function getDemoCategories(): Category[] {
  return DEMO_CATEGORIES.map((category) => ({ ...category }));
}

export function getDemoSections(pageTarget?: string): Section[] {
  if (!pageTarget || pageTarget === 'home') {
    return DEMO_HOME_SECTIONS.map((section) => ({ ...section }));
  }
  return [];
}
