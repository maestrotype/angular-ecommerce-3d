import { DataSource } from 'typeorm';
import { Category } from './src/categories/entities/category.entity';
import { Section } from './src/sections/entities/section.entity';
import * as dotenv from 'dotenv';

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

async function audit() {
    try {
        console.log('Connecting to Supabase...');
        await AppDataSource.initialize();
        console.log('Database connected');

        const categories = await AppDataSource.getRepository(Category).find();
        console.log('--- Categories ---');
        console.log(JSON.stringify(categories, null, 2));

        const sections = await AppDataSource.getRepository(Section).find();
        console.log('--- Sections ---');
        console.log(JSON.stringify(sections, null, 2));

        await AppDataSource.destroy();
    } catch (error) {
        console.error('Error during audit:', error);
    }
}

audit();
