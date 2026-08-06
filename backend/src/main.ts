import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { existsSync, mkdirSync } from "fs";

// Load environment variables from .env file
const envPath = resolve(__dirname, '..', '.env');
dotenv.config({ path: envPath });

import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";
import { join } from "path";
import { AllExceptionsFilter } from "./common/filters/http-exception.filter";
import { LoggingInterceptor } from "./common/interceptors/logging.interceptor";
import { json, urlencoded } from 'express';
import { assertProductionSecrets } from './config/production-secrets';

async function bootstrap() {
  assertProductionSecrets();

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Increase payload limits for 3D models and images
  app.use(json({ limit: '100mb' }));
  app.use(urlencoded({ extended: true, limit: '100mb' }));

  // Ensure /uploads exists
  const uploadPath = join(__dirname, "..", "uploads");
  const upload3dPath = join(uploadPath, "sections-3d");
  const uploadProducts3dPath = join(uploadPath, "products-3d");

  if (!existsSync(uploadPath)) {
    mkdirSync(uploadPath);
    console.log("Created /uploads folder");
  }
  if (!existsSync(upload3dPath)) {
    mkdirSync(upload3dPath);
    console.log("Created /uploads/sections-3d folder");
  }
  if (!existsSync(uploadProducts3dPath)) {
    mkdirSync(uploadProducts3dPath);
    console.log("Created /uploads/products-3d folder");
  }

  // Enable CORS for Angular frontend - including GitHub Pages
  app.enableCors({
    origin: [
      "http://localhost:4200",
      "http://localhost:3002",
      "https://angular-ecommerce-3d-production.up.railway.app",
      "https://maestrotype.github.io", // GitHub Pages domain
      /^https:\/\/.*\.github\.io$/, // Allow any GitHub Pages subdomain
      /^https:\/\/.*\.netlify\.app$/, // Allow Netlify if needed
      /^https:\/\/.*\.vercel\.app$/, // Allow Vercel if needed
    ],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    optionsSuccessStatus: 200,
  });

  // Global exception filter - catches ALL errors safely
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global logging interceptor
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Global validation pipe - enables DTO validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false, // Changed to false to allow extra fields
      transform: true,
    })
  );

  // Enable static /uploads
  app.useStaticAssets(uploadPath, {
    prefix: '/uploads/',
  });

  // Global prefix for API routes
  app.setGlobalPrefix("api");

  const port = process.env.PORT || 3002;
  setInterval(() => {
    const used = process.memoryUsage();
    console.log('Memory usage:', {
      rss: (used.rss / 1024 / 1024).toFixed(2) + ' MB',
      heapTotal: (used.heapTotal / 1024 / 1024).toFixed(2) + ' MB',
      heapUsed: (used.heapUsed / 1024 / 1024).toFixed(2) + ' MB',
      external: (used.external / 1024 / 1024).toFixed(2) + ' MB',
    });
  }, 60000);
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}/api`);
}
bootstrap();
