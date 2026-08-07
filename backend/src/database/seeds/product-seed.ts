
import { DataSource } from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { User } from '../../auth/entities/user.entity';
import { Order } from '../../orders/entities/order.entity';
import { Category } from '../../categories/entities/category.entity';
import { Notification } from '../../notifications/entities/notification.entity';
import { Section } from '../../sections/entities/section.entity';
import { Message } from '../../messages/entities/message.entity';
import { ProductRecommendation } from '../../recommendations/entities/product-recommendation.entity';
import { Payment } from '../../payments/entities/payment.entity';
import { Settings } from '../../settings/entities/settings.entity';
import { Page } from '../../pages/entities/page.entity';

const DEMO = {
  headphones: 'assets/demo/products/headphones.svg',
  tshirt: 'assets/demo/products/t-shirt.svg',
  book: 'assets/demo/products/book.svg',
  garden: 'assets/demo/products/garden-system.svg',
  yoga: 'assets/demo/products/yoga-mat.svg',
  sneaker: 'assets/demo/products/sneaker.svg',
  duck: 'assets/demo/models/duck.glb',
  avocado: 'assets/demo/models/avocado.glb',
  bottle: 'assets/demo/models/water-bottle.glb',
  mug: 'assets/demo/products/travel-mug.svg',
} as const;

export async function seedProducts(dataSource: DataSource) {
  const productRepository = dataSource.getRepository(Product);

  const existingProducts = await productRepository.count();
  if (existingProducts > 0) {
    console.log('Products already seeded');
    return;
  }

  const sampleProducts = [
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
      name: 'Organic Cotton T-Shirt',
      category: 'clothing',
      price: 24.99,
      stock: 100,
      description: 'Comfortable organic cotton t-shirt in various colors and sizes.',
      imageUrl: DEMO.tshirt,
      specifications: {
        material: '100% Organic Cotton',
        fit: 'Regular',
        care: 'Machine Wash Cold',
      },
      rating: 4.2,
      features: ['Organic Material', 'Comfortable Fit', 'Eco-Friendly'],
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
      model3dUrl: DEMO.avocado,
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
      name: '3D Showcase Sneaker',
      category: 'clothing',
      price: 129.99,
      stock: 40,
      description: 'Premium sneaker with bundled demo 3D model — rotate and zoom on the product page.',
      imageUrl: DEMO.sneaker,
      model3dUrl: DEMO.bottle,
      specifications: {
        material: 'Mesh + Rubber',
        sizes: 'EU 38–46',
        color: 'Red/White',
      },
      isSpecial: true,
      rating: 4.7,
      features: ['3D Product View', 'Lightweight Sole', 'Breathable Upper'],
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
      model3dUrl: DEMO.bottle,
      specifications: {
        capacity: '450ml',
        material: 'Stainless Steel',
        lid: 'Leak-proof',
      },
      rating: 4.5,
      features: ['Insulated', 'Dishwasher Safe', 'BPA Free'],
    },
  ];

  await productRepository.save(sampleProducts);
  console.log(`Seeded ${sampleProducts.length} demo products (local assets, no external URLs)`);
}
