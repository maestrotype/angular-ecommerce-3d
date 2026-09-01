import { DataSource } from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { Category } from '../../categories/entities/category.entity';
import { Section } from '../../sections/entities/section.entity';

const DEMO = {
  headphones: 'assets/demo/products/headphones.svg',
  tshirt: 'assets/demo/products/t-shirt.svg',
  book: 'assets/demo/products/book.svg',
  garden: 'assets/demo/products/garden-system.svg',
  yoga: 'assets/demo/products/yoga-mat.svg',
  sneaker: 'assets/demo/products/sneaker.svg',
  bag: 'assets/demo/products/bag.svg',
  duck: 'assets/demo/models/duck.glb',
  mug: 'assets/demo/products/travel-mug.svg',
} as const;

const HERO_TYPES = new Set(['hero', 'hero-glass', 'video-hero']);

type Localized = { en: string; ru: string; ua: string };

type FashionSeed = {
  sku: string;
  legacyNames: string[];
  name: Localized;
  category: 'bags' | 'clothing' | 'shoes';
  price: number;
  stock: number;
  description: Localized;
  imageUrl: string;
  model3dUrl: string;
  specifications: Record<string, string>;
  isSpecial?: boolean;
  rating: number;
  features: string[];
};

/** Fashion SKUs always use the committed duck.glb so Product Stage works after clone. */
const FASHION_PRODUCTS: FashionSeed[] = [
  {
    sku: 'SEED-BAG-01',
    legacyNames: ['Saddle Crossbody'],
    name: { en: 'Saddle Crossbody', ru: 'Седельная сумка', ua: 'Сідельна сумка' },
    category: 'bags',
    price: 189,
    stock: 24,
    description: {
      en: 'Structured leather-look crossbody with a sculpted flap. Orbit the 3D model on the homepage stage.',
      ru: 'Структурированная сумка через плечо. Крутите 3D-модель на витрине главной.',
      ua: 'Структурована сумка через плече. Обертайте 3D-модель на вітрині головної.',
    },
    imageUrl: DEMO.bag,
    model3dUrl: DEMO.duck,
    specifications: { material: 'Grain leather', strap: 'Adjustable', color: 'Sand' },
    isSpecial: true,
    rating: 4.7,
    features: ['3D Product View', 'Adjustable Strap', 'Interior Pocket'],
  },
  {
    sku: 'SEED-BAG-02',
    legacyNames: ['Weekend Tote'],
    name: { en: 'Weekend Tote', ru: 'Шопер Weekend', ua: 'Шопер Weekend' },
    category: 'bags',
    price: 149,
    stock: 30,
    description: {
      en: 'Open tote for daily carry. Same catalog SKU used on Product Stage and the product page.',
      ru: 'Открытый шопер на каждый день. Тот же SKU на витрине и карточке товара.',
      ua: 'Відкритий шопер на щодень. Той самий SKU на вітрині та картці товару.',
    },
    imageUrl: DEMO.bag,
    model3dUrl: DEMO.duck,
    specifications: { material: 'Canvas + leather', volume: '18 L', color: 'Sand' },
    rating: 4.5,
    features: ['3D Product View', 'Wide Opening', 'Unlined'],
  },
  {
    sku: 'SEED-CLOTH-01',
    legacyNames: ['Organic Cotton T-Shirt'],
    name: {
      en: 'Organic Cotton T-Shirt',
      ru: 'Футболка из органического хлопка',
      ua: 'Футболка з органічної бавовни',
    },
    category: 'clothing',
    price: 24.99,
    stock: 100,
    description: {
      en: 'Comfortable organic cotton t-shirt in a regular fit. Includes a demo GLB for the 3D stage.',
      ru: 'Футболка из органического хлопка свободного кроя. С демо-GLB для 3D-витрины.',
      ua: 'Футболка з органічної бавовни вільного крою. З демо-GLB для 3D-вітрини.',
    },
    imageUrl: DEMO.tshirt,
    model3dUrl: DEMO.duck,
    specifications: { material: '100% Organic Cotton', fit: 'Regular', care: 'Machine Wash Cold' },
    rating: 4.2,
    features: ['Organic Material', 'Comfortable Fit', '3D Product View'],
  },
  {
    sku: 'SEED-SHOE-01',
    legacyNames: ['3D Showcase Sneaker', 'Court Runner'],
    name: { en: 'Court Runner', ru: 'Кроссовки Court Runner', ua: 'Кросівки Court Runner' },
    category: 'shoes',
    price: 129.99,
    stock: 40,
    description: {
      en: 'Court sneaker with a bundled demo 3D model — rotate and zoom on Product Stage and the PDP.',
      ru: 'Кроссовки с демо-3D-моделью — вращайте на витрине и карточке товара.',
      ua: 'Кросівки з демо-3D-моделлю — обертайте на вітрині та картці товару.',
    },
    imageUrl: DEMO.sneaker,
    model3dUrl: DEMO.duck,
    specifications: { material: 'Mesh + Rubber', sizes: 'EU 38–46', color: 'Red/White' },
    isSpecial: true,
    rating: 4.7,
    features: ['3D Product View', 'Lightweight Sole', 'Breathable Upper'],
  },
  {
    sku: 'SEED-SHOE-02',
    legacyNames: ['City Loafer'],
    name: { en: 'City Loafer', ru: 'Лоферы City', ua: 'Лофери City' },
    category: 'shoes',
    price: 159,
    stock: 22,
    description: {
      en: 'Slip-on loafer with a stacked sole. Catalog-linked 3D on the homepage stage.',
      ru: 'Лоферы без шнуровки. 3D с витрины главной связан с каталогом.',
      ua: 'Лофери без шнурівки. 3D з вітрини головної пов’язаний із каталогом.',
    },
    imageUrl: DEMO.sneaker,
    model3dUrl: DEMO.duck,
    specifications: { material: 'Smooth leather', sizes: 'EU 39–45', color: 'Oxblood' },
    rating: 4.4,
    features: ['3D Product View', 'Slip-on', 'Stacked Sole'],
  },
];

const OTHER_PRODUCTS = [
  {
    name: 'Wireless Bluetooth Headphones',
    category: 'electronics',
    price: 99.99,
    stock: 50,
    description: 'High-quality wireless headphones with noise cancellation and 30-hour battery life.',
    imageUrl: DEMO.headphones,
    model3dUrl: DEMO.duck,
    specifications: {
      brand: 'TechCorp',
      model: 'WH-1000XM4',
      color: 'Black',
      batteryLife: '30 hours',
      connectivity: 'Bluetooth 5.0',
    },
    isSpecial: true,
    rating: 4.5,
    features: ['Noise Cancellation', 'Quick Charge', 'Voice Assistant'],
  },
  {
    name: 'The Complete Guide to JavaScript',
    category: 'books',
    price: 39.99,
    stock: 25,
    description: 'Comprehensive guide to modern JavaScript programming with practical examples.',
    imageUrl: DEMO.book,
    specifications: {
      author: 'John Developer',
      pages: '450',
      publisher: 'Tech Books',
      isbn: '978-1234567890',
    },
    rating: 4.8,
    features: ['ES6+ Features', 'Practical Examples', 'Advanced Concepts'],
  },
  {
    name: 'Smart Garden Watering System',
    category: 'home',
    price: 149.99,
    stock: 15,
    description: 'Automated watering system for your garden with smartphone app control.',
    imageUrl: DEMO.garden,
    model3dUrl: DEMO.duck,
    specifications: {
      coverage: 'Up to 20 plants',
      batteryLife: '6 months',
      connectivity: 'Wi-Fi',
      appControl: 'iOS/Android',
    },
    isSpecial: true,
    rating: 4.6,
    features: ['App Control', 'Water Scheduling', 'Weather Integration'],
  },
  {
    name: 'Professional Yoga Mat',
    category: 'sports',
    price: 79.99,
    stock: 30,
    description: 'Non-slip yoga mat made from eco-friendly materials with excellent grip.',
    imageUrl: DEMO.yoga,
    specifications: {
      thickness: '6mm',
      material: 'Natural Rubber',
      size: '72" x 24"',
      weight: '2.5 lbs',
    },
    rating: 4.4,
    features: ['Non-Slip Surface', 'Eco-Friendly', 'Lightweight'],
  },
  {
    name: 'Minimalist Desk Lamp',
    category: 'home',
    price: 59.99,
    stock: 35,
    description: 'Adjustable LED desk lamp with warm and cool light modes.',
    imageUrl: DEMO.garden,
    specifications: {
      power: '12W LED',
      modes: 'Warm / Cool / Reading',
      material: 'Aluminum',
    },
    rating: 4.3,
    features: ['Dimmable', 'USB Port', 'Touch Control'],
  },
  {
    name: 'Stainless Travel Mug',
    category: 'home',
    price: 34.99,
    stock: 60,
    description: 'Double-wall insulated mug keeps drinks hot for 8 hours.',
    imageUrl: DEMO.mug,
    model3dUrl: DEMO.duck,
    specifications: {
      capacity: '450ml',
      material: 'Stainless Steel',
      lid: 'Leak-proof',
    },
    rating: 4.5,
    features: ['Insulated', 'Dishwasher Safe', 'BPA Free'],
  },
];

const CATALOG_CATEGORIES: Array<{
  slug: string;
  name: Localized;
  icon: string;
}> = [
  {
    slug: 'bags',
    name: { en: 'Bags', ru: 'Сумки', ua: 'Сумки' },
    icon: 'assets/icons/shopping-cart.svg',
  },
  {
    slug: 'clothing',
    name: { en: 'Clothing', ru: 'Одежда', ua: 'Одяг' },
    icon: 'assets/icons/clothing.svg',
  },
  {
    slug: 'shoes',
    name: { en: 'Shoes', ru: 'Обувь', ua: 'Взуття' },
    icon: 'assets/icons/shopping-cart.svg',
  },
];

function productNameEn(product: Product): string {
  const name = product.name as unknown;
  if (typeof name === 'string') {
    return name;
  }
  if (name && typeof name === 'object') {
    const record = name as Record<string, string>;
    return record.en || record.ru || record.ua || Object.values(record).find(Boolean) || '';
  }
  return '';
}

function productSku(product: Product): string {
  return (product.specifications && product.specifications['sku']) || '';
}

function toProductPayload(seed: FashionSeed): Partial<Product> {
  return {
    name: seed.name,
    category: seed.category,
    price: seed.price,
    stock: seed.stock,
    description: seed.description,
    imageUrl: seed.imageUrl,
    model3dUrl: seed.model3dUrl,
    specifications: { ...seed.specifications, sku: seed.sku },
    isSpecial: seed.isSpecial === true,
    rating: seed.rating,
    features: seed.features,
  };
}

async function seedCatalogCategories(dataSource: DataSource): Promise<void> {
  const repo = dataSource.getRepository(Category);
  let created = 0;
  for (const entry of CATALOG_CATEGORIES) {
    const existing = await repo.findOne({ where: { slug: entry.slug } });
    if (existing) {
      continue;
    }
    await repo.save(
      repo.create({
        name: entry.name,
        slug: entry.slug,
        icon: entry.icon,
        description: entry.name,
        isActive: true,
      }),
    );
    created += 1;
  }
  if (created) {
    console.log(`Seeded ${created} catalog categories (bags / clothing / shoes)`);
  }
}

async function upsertFashionProducts(dataSource: DataSource): Promise<void> {
  const repo = dataSource.getRepository(Product);
  const existing = await repo.find();
  let inserted = 0;
  let updated = 0;

  for (const seed of FASHION_PRODUCTS) {
    const match = existing.find((product) => {
      const sku = productSku(product);
      if (sku && sku === seed.sku) {
        return true;
      }
      const name = productNameEn(product);
      return seed.legacyNames.some((legacy) => legacy === name);
    });

    if (match) {
      Object.assign(match, toProductPayload(seed), {
        specifications: { ...(match.specifications || {}), sku: seed.sku, ...seed.specifications },
      });
      await repo.save(match);
      updated += 1;
      continue;
    }

    await repo.save(repo.create(toProductPayload(seed)));
    inserted += 1;
  }

  console.log(`Fashion catalog: ${inserted} inserted, ${updated} updated (bags / clothing / shoes + GLB)`);
}

async function fashionProductIds(dataSource: DataSource): Promise<number[]> {
  const repo = dataSource.getRepository(Product);
  const existing = await repo.find();
  const ids: number[] = [];
  for (const seed of FASHION_PRODUCTS) {
    const match = existing.find((product) => {
      return productSku(product) === seed.sku || productNameEn(product) === seed.name.en;
    });
    if (match?.id) {
      ids.push(match.id);
    }
  }
  return ids;
}

async function seedProductStageSection(dataSource: DataSource): Promise<void> {
  const repo = dataSource.getRepository(Section);
  const productIds = await fashionProductIds(dataSource);
  const stageSettings = {
    categories: ['bags', 'clothing', 'shoes'],
    productIds,
    limit: 5,
    autoRotate: true,
  };

  const existing = await repo.findOne({ where: { type: 'product-stage', pageTarget: 'home' } });
  if (existing) {
    existing.settings = { ...(existing.settings || {}), ...stageSettings };
    existing.isActive = true;
    existing.show3d = true;
    await repo.save(existing);
    console.log(`Updated Product Stage pinned SKUs: ${productIds.join(', ') || '(none)'}`);
    return;
  }

  const homeSections = await repo.find({
    where: { pageTarget: 'home' },
    order: { order: 'ASC' },
  });
  const hero = homeSections.find((section) => HERO_TYPES.has(section.type));
  const insertOrder = hero ? hero.order + 1 : 2;
  const toShift = homeSections.filter((section) => section.order >= insertOrder);
  for (const section of toShift) {
    section.order += 1;
  }
  if (toShift.length) {
    await repo.save(toShift);
  }

  await repo.save(
    repo.create({
      type: 'product-stage',
      title: { en: 'Turn it in 3D', ru: 'Поверни в 3D', ua: 'Поверни в 3D' },
      subtitle: { en: 'Live catalog', ru: 'Живой каталог', ua: 'Живий каталог' },
      content: {
        en: 'Bags, clothing, and shoes from the shop — drag to orbit, then add to cart.',
        ru: 'Сумки, одежда и обувь из магазина — крутите модель и добавляйте в корзину.',
        ua: 'Сумки, одяг і взуття з магазину — обертайте модель і додавайте в кошик.',
      },
      isActive: true,
      pageTarget: 'home',
      variant: 'default',
      anchorId: 'product-stage',
      show3d: true,
      showImage: false,
      order: insertOrder,
      settings: stageSettings,
    }),
  );
  console.log(`Seeded Product Stage on home (order ${insertOrder})`);
}

export async function seedProducts(dataSource: DataSource) {
  await seedCatalogCategories(dataSource);
  const productRepository = dataSource.getRepository(Product);
  const existingProducts = await productRepository.count();

  if (existingProducts === 0) {
    await productRepository.save([
      ...FASHION_PRODUCTS.map((seed) => toProductPayload(seed)),
      ...(OTHER_PRODUCTS as Partial<Product>[]),
    ]);
    console.log(
      `Seeded ${FASHION_PRODUCTS.length + OTHER_PRODUCTS.length} demo products (fashion SKUs use duck.glb)`,
    );
  } else {
    console.log('Products already present — upserting bags / clothing / shoes with GLB');
    await upsertFashionProducts(dataSource);
  }

  await seedProductStageSection(dataSource);
}
