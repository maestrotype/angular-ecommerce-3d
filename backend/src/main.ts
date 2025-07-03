import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";
import { existsSync, mkdirSync } from "fs";
import { join } from "path";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Ensure /uploads exists
  const uploadPath = join(__dirname, "..", "uploads");
  if (!existsSync(uploadPath)) {
    mkdirSync(uploadPath);
    console.log("Created /uploads folder");
  }

  // Enable CORS for Angular frontend - including GitHub Pages
  app.enableCors({
    origin: [
      "http://localhost:4200",
      "http://localhost:3002",
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

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
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
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}/api`);
}
bootstrap();
