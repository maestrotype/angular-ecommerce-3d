
import { DataSource } from 'typeorm';
import { Product } from '../../products/entities/product.entity';

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
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
      specifications: {
        brand: 'TechCorp',
        model: 'WH-1000XM4',
        color: 'Black',
        batteryLife: '30 hours',
        connectivity: 'Bluetooth 5.0'
      },
      isSpecial: true,
      rating: 4.5,
      features: ['Noise Cancellation', 'Quick Charge', 'Voice Assistant']
    },
    {
      name: 'Organic Cotton T-Shirt',
      category: 'clothing',
      price: 24.99,
      stock: 100,
      description: 'Comfortable organic cotton t-shirt in various colors and sizes.',
      imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
      specifications: {
        material: '100% Organic Cotton',
        fit: 'Regular',
        care: 'Machine Wash Cold'
      },
      rating: 4.2,
      features: ['Organic Material', 'Comfortable Fit', 'Eco-Friendly']
    },
    {
      name: 'The Complete Guide to JavaScript',
      category: 'books',
      price: 39.99,
      stock: 25,
      description: 'Comprehensive guide to modern JavaScript programming with practical examples.',
      imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500',
      specifications: {
        author: 'John Developer',
        pages: '450',
        publisher: 'Tech Books',
        isbn: '978-1234567890'
      },
      rating: 4.8,
      features: ['ES6+ Features', 'Practical Examples', 'Advanced Concepts']
    },
    {
      name: 'Smart Garden Watering System',
      category: 'home',
      price: 149.99,
      stock: 15,
      description: 'Automated watering system for your garden with smartphone app control.',
      imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500',
      specifications: {
        coverage: 'Up to 20 plants',
        batteryLife: '6 months',
        connectivity: 'Wi-Fi',
        appControl: 'iOS/Android'
      },
      isSpecial: true,
      rating: 4.6,
      features: ['App Control', 'Water Scheduling', 'Weather Integration']
    },
    {
      name: 'Professional Yoga Mat',
      category: 'sports',
      price: 79.99,
      stock: 30,
      description: 'Non-slip yoga mat made from eco-friendly materials with excellent grip.',
      imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500',
      specifications: {
        thickness: '6mm',
        material: 'Natural Rubber',
        size: '72" x 24"',
        weight: '2.5 lbs'
      },
      rating: 4.4,
      features: ['Non-Slip Surface', 'Eco-Friendly', 'Lightweight']
    }
  ];

  await productRepository.save(sampleProducts);
  console.log('Sample products seeded successfully');
}
