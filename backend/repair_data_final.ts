import { DataSource } from 'typeorm';
import { Category } from './src/categories/entities/category.entity';
import { Section } from './src/sections/entities/section.entity';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: '.env' });

const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    entities: [Category, Section],
    synchronize: false,
    ssl: {
        rejectUnauthorized: false
    }
});

async function repair() {
    try {
        console.log('Connecting to Supabase...');
        await AppDataSource.initialize();
        console.log('Database connected');

        const categoryRepo = AppDataSource.getRepository(Category);
        const sectionRepo = AppDataSource.getRepository(Section);

        // 1. Repair Categories
        const categories = await categoryRepo.find();
        for (const cat of categories) {
            console.log(`Checking category: ${cat.slug || cat.id}`);
            if (cat.name === null || typeof cat.name === 'string') {
                let nameEn = cat.slug || 'Category';
                nameEn = nameEn.charAt(0).toUpperCase() + nameEn.slice(1);
                
                let nameRu = nameEn;
                if (cat.slug === 'shoes') { nameEn = 'Shoes'; nameRu = 'Обувь'; }
                if (cat.slug === 'clothing') { nameEn = 'Clothing'; nameRu = 'Одежда'; }
                if (cat.slug === 'bags') { nameEn = 'Bags'; nameRu = 'Сумки'; }
                if (cat.slug === 'handbags') { nameEn = 'Handbags'; nameRu = 'Сумки'; }
                
                cat.name = { en: nameEn, ru: nameRu };
                cat.description = { 
                    en: `Explore our premium ${nameEn.toLowerCase()} collection.`, 
                    ru: `Ознакомьтесь с нашей коллекцией ${nameRu.toLowerCase()} премиум-класса.` 
                };
                await categoryRepo.save(cat);
                console.log(`Repaired category: ${cat.slug}`);
            }
        }

        // 2. Repair Sections
        const sections = await sectionRepo.find();
        for (const section of sections) {
            console.log(`Checking section: ${section.type}`);
            if (section.title === null || typeof section.title === 'string') {
                switch(section.type) {
                    case 'hero-glass':
                        section.title = { en: 'Discover Our Collection', ru: 'Откройте для себя нашу коллекцию' };
                        section.content = { en: 'Experience shopping in 3D with our premium collection.', ru: 'Оцените покупки в 3D с нашей коллекцией премиум-класса.' };
                        break;
                    case 'best-sellers':
                        section.title = { en: 'Best Sellers', ru: 'Хиты продаж' };
                        break;
                    case 'special-offer':
                        section.title = { en: 'Special Offer', ru: 'Специальное предложение' };
                        break;
                    case 'categories':
                        section.title = { en: 'Featured Categories', ru: 'Избранные категории' };
                        break;
                    case 'contacts':
                        section.title = { en: 'Contact Us', ru: 'Связаться с нами' };
                        break;
                    case 'brands':
                        section.title = { en: 'Our Brands', ru: 'Наши бренды' };
                        break;
                }
                await sectionRepo.save(section);
                console.log(`Repaired section content: ${section.type}`);
            }
        }

        // 3. Ensure 'about' section exists
        let aboutSection = await sectionRepo.findOne({ where: { type: 'about' } });
        if (!aboutSection) {
            console.log('Creating missing About section...');
            aboutSection = sectionRepo.create({
                type: 'about',
                title: { en: 'About Maestro', ru: 'О проекте Maestro' },
                subtitle: { en: 'Innovative 3D E-commerce', ru: 'Инновационная 3D-электронная коммерция' },
                content: { en: 'We combine art and technology to provide the most immersive shopping experience.', ru: 'Мы объединяем искусство и технологии для создания максимально захватывающего опыта покупок.' },
                isActive: true,
                order: 10,
                showImage: true,
                imageUrl: 'https://res.cloudinary.com/dyaywxvii/image/upload/v1755762537/section-images/xgihutoedhnacxwvrcmg.png',
                settings: {
                    subtitle: { en: 'Our Story', ru: 'Наша история' }
                }
            });
            await sectionRepo.save(aboutSection);
            console.log('Created About section');
        } else {
            console.log('Found existing About section, updating...');
            aboutSection.isActive = true;
            if (aboutSection.title === null || typeof aboutSection.title === 'string') {
                aboutSection.title = { en: 'About Maestro', ru: 'О проекте Maestro' };
                aboutSection.content = { en: 'We combine art and technology to provide the most immersive shopping experience.', ru: 'Мы объединяем искусство и технологии для создания максимально захватывающего опыта покупок.' };
                aboutSection.settings = {
                    ...aboutSection.settings,
                    subtitle: { en: 'Our Story', ru: 'Наша история' }
                };
            }
            await sectionRepo.save(aboutSection);
            console.log('Updated About section');
        }

        await AppDataSource.destroy();
        console.log('Data repair complete');
    } catch (error) {
        console.error('Error during repair:', error);
    }
}

repair();
