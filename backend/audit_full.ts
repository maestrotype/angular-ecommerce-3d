import { DataSource } from 'typeorm';
import { Category } from './src/categories/entities/category.entity';
import { Section } from './src/sections/entities/section.entity';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'ecommerce',
    entities: [Category, Section],
    synchronize: false,
});

async function audit() {
    try {
        await AppDataSource.initialize();
        console.log('Database connected');

        const allCategories = await AppDataSource.getRepository(Category).find();
        console.log('--- ALL Categories ---');
        console.log(JSON.stringify(allCategories, null, 2));

        const allSections = await AppDataSource.getRepository(Section).find();
        console.log('--- ALL Sections ---');
        console.log(JSON.stringify(allSections, null, 2));

        await AppDataSource.destroy();
    } catch (error) {
        console.error('Error during audit:', error);
    }
}

audit();
