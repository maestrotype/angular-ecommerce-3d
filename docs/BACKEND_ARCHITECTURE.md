# Backend Architecture Documentation

> **Generated from source code** - 2026-07-06 · **Diagram + overview refreshed** 2026-08-06  
> Visual overview: [`BACKEND_ARCHITECTURE_DIAGRAM.html`](BACKEND_ARCHITECTURE_DIAGRAM.html)  
> This document is the single source of truth for backend architecture.
> JSON model: `docs/backend-architecture.json`  
> **Note:** Older sections below may still mention SQLite/OAuth/Python worker — prefer the diagram and Technology Stack table above when they conflict; a full doc pass is tracked under marketplace Track A.

---

## Table of Contents

1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Architecture Principles](#architecture-principles)
4. [Module Architecture](#module-architecture)
5. [Dependency Graph](#dependency-graph)
6. [REST API Reference](#rest-api-reference)
7. [Database Schema](#database-schema)
8. [Authentication & Authorization](#authentication--authorization)
9. [AI Generation Pipeline](#ai-generation-pipeline)
10. [File Upload Pipeline](#file-upload-pipeline)
11. [Payment Flow](#payment-flow)
12. [Notification System](#notification-system)
13. [Email System](#email-system)
14. [External Integrations](#external-integrations)
15. [Configuration & Environment](#configuration--environment)
16. [Request Lifecycle](#request-lifecycle)
17. [Error Handling](#error-handling)
18. [Security](#security)
19. [Performance](#performance)
20. [Known Technical Debt](#known-technical-debt)
21. [Future Improvements](#future-improvements)

---

## Overview

This is a **NestJS + TypeORM + PostgreSQL** backend powering an Angular e-commerce platform with 3D model capabilities. The system supports product catalog management, order processing, multi-provider payment integration, AI-powered 3D model generation (external provider APIs), and admin dashboard functionality.

### Key Characteristics

- **Monolithic architecture** with modular NestJS structure
- **Type-safe** end-to-end (TypeScript backend + TypeScript frontend)
- **PostgreSQL database** via TypeORM (`database.config.ts`)
- **JWT authentication** with role-based access control (USER, ADMIN)
- **Cloudinary** for image and GLB storage (with local `uploads/` fallback)
- **Payments**: Stripe, LiqPay, PayPal (strategy pattern)
- **AI generation**: NestJS provider adapters (Tripo3D, Meshy, Hunyuan, Luma, Unique3D, Custom)

---

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | NestJS | 10.x |
| Language | TypeScript | ^5.4.0 |
| ORM | TypeORM | 0.3.x |
| Database | PostgreSQL | 14+ |
| Validation | class-validator + class-transformer | Latest |
| Authentication | @nestjs/passport + JWT + bcrypt | Latest |
| File Upload | multer + @nestjs/platform-express | Latest |
| Cloud Storage | cloudinary | Latest |
| Payments | Stripe · LiqPay · PayPal strategies | Latest |
| Email | nodemailer (EmailModule) | Latest |
| AI 3D | External provider HTTP APIs | Latest |
| Testing | jest + @nestjs/testing | Configured |
| HTTP Client | axios | Latest |

---

## Architecture Principles

1. **Modular Design**: Each domain has its own module with clear boundaries
2. **Separation of Concerns**: Controllers → Services → Repositories
3. **Type Safety**: Full TypeScript with strict mode
4. **DTO Validation**: All inputs validated via class-validator decorators
5. **Role-Based Access**: JWT guards + Admin guards for authorization
6. **Dependency Injection**: NestJS DI container for all services
7. **Configuration-Driven**: Environment-based configuration via ConfigModule

---

## Module Architecture

### Core Modules

#### App Module (`app.module.ts`)
The root module that bootstraps the application. Imports all feature modules and configures global settings.

```typescript
@Module({
  imports: [
    ConfigModule.forRoot({...}),
    GlobalExceptionFilter, // Exception handling
    DatabaseModule,
    AuthModule,
    UsersModule,
    ProductsModule,
    CategoriesModule,
    OrdersModule,
    PaymentsModule,
    CartModule,
    ReviewsModule,
    FavoritesModule,
    SectionsModule,
    PagesModule,
    MessagesModule,
    NotificationsModule,
    SEOModule,
    SettingsModule,
    UploadModule,
    AIGenerationModule,
    RecommendationsModule,
    EmailModule,
    HealthModule,
    ThrottlerModule.forRoot([...]), // Rate limiting
    BullModule.forRoot({...}), // Queue configuration
    SwaggerModule, // API documentation
  ]
})
```

#### Database Module (`database/database.module.ts`)
Configures TypeORM with SQLite connection. Uses `database/database.sqlite` as the default database file.

- **Connection**: TypeORM with SQLite
- **Entities**: Auto-loaded from `dist/**/*.entity.js`
- **Synchronize**: Enabled in development, disabled in production
- **Logging**: Enabled in development

#### Config Module (`config/app.config.ts`)
Provides type-safe configuration access via `@nestjs/config`.

**Configuration Factory Returns:**
```typescript
{
  database: { host, port, isActivated, name, username, password, entities },
  jwt: { secret, expiration },
  cloudinary: { cloudName, apiKey, apiSecret },
  stripe: { secretKey, webhookSecret, publishableKey },
  email: { user, client },
  frontendDomain: string,
  aiWorkerUrl: string,
  googleMapsApiKey: string,
  openaiApiKey: string,
  tripo3dApiKey: string,
  uavMappingApiKey: string,
  adminEmail: string,
  port: number
}
```

---

### Feature Modules

#### Auth Module (`auth/`)
Handles authentication and authorization.

| Component | Description |
|-----------|-------------|
| `AuthController` | POST /auth/login, /register, /logout, /check, GET /auth/profile, /auth/oauth/google, /auth/oauth/github |
| `AuthService` | Login, register, validate, refresh tokens, OAuth callbacks |
| `JwtAuthGuard` | Extends AuthGuard('jwt'), attaches user to request |
| `AdminGuard` | CanActivate guard checking UserRole.ADMIN |
| LocalStrategy | Username/password validation |
| JwtStrategy | JWT token verification |
| GoogleOAuthStrategy | Google OAuth2 callback handling |
| GitHubOAuthStrategy | GitHub OAuth2 callback handling |

#### Users Module (`users/`)
User management and CRUD operations.

| Component | Description |
|-----------|-------------|
| `UsersController` | GET /users, /users/:id, POST/PUT/DELETE /users/:id |
| `UsersService` | findAll, findOne, create, update, remove users |
| `UserEntity` | id, email, username, password, firstName, lastName, phone, avatar, role, isActive, createdAt, updatedAt |
| `CreateUserDto` | Validation for user creation |
| `UpdateUserDto` | Partial validation for user updates |

#### Products Module (`products/`)
Product catalog with 3D model support.

| Component | Description |
|-----------|-------------|
| `ProductsController` | Full CRUD + /:id/images, /:id/views, /search, /categories/:categoryId |
| `ProductsService` | Business logic for products including 3D model management |
| `ProductEntity` | Comprehensive product model with 15+ fields |
| `CreateProductDto` | Full validation for product creation |
| `UpdateProductDto` | Partial validation for updates |
| `ProductImageEntity` | Image URLs and metadata per product |
| `ProductReviewEntity` | User reviews with ratings |

**Product Entity Fields:**
- id, name, description, price, oldPrice, currency
- sku, stockQuantity, weight, dimensions
- categoryId, category (ManyToOne)
- images (OneToMany ProductImage)
- model3dUrl, model3dThumbnail (3D model files)
- is3dAvailable, is3dPrinting (generation status flags)
- rating, salesCount
- reviews (OneToMany ProductReview)
- isActive, isFeatured, tags
- createdAt, updatedAt

#### Categories Module (`categories/`)
Product categorization.

| Component | Description |
|-----------|-------------|
| `CategoriesController` | GET /categories, /:id, POST/PUT/DELETE /:id |
| `CategoriesService` | CRUD operations for categories |
| `CategoryEntity` | id, name, slug, description, parentId, parent, children, icon, bannerImage, sortOrder, isActive |

**Relations:**
- Self-referencing: parent (ManyToOne), children (OneToMany)
- Products: OneToMany

#### Orders Module (`orders/`)
Order processing and management.

| Component | Description |
|-----------|-------------|
| `OrdersController` | GET /orders, /:id, POST /orders (create), PUT /:id/status |
| `OrdersService` | Order creation, status updates, total calculation |
| `OrderEntity` | id, userId, user, items, status, total, shippingAddress, notes, stripePaymentId, createdAt |
| `OrderItemEntity` | id, orderId, order, productId, product, quantity, price, name, imageUrl |

**Order Statuses:** PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED

#### Payments Module (`payments/`)
Stripe payment integration.

| Component | Description |
|-----------|-------------|
| `PaymentsController` | POST /payments/create-intent, /webhook/stripe, GET /payments |
| `PaymentsService` | Stripe PaymentIntent creation, webhook handling |
| `PaymentEntity` | id, orderId, amount, currency, status, stripePaymentIntentId, method, metadata, createdAt |

**Stripe Integration:**
- PaymentIntent creation via Stripe API
- Webhook endpoint for async payment events
- Supports card payments

#### Cart Module (`cart/`)
Shopping cart management.

| Component | Description |
|-----------|-------------|
| `CartController` | GET /cart, POST /cart/items, PUT /cart/items/:id, DELETE /cart/items/:id |
| `CartService` | Add/remove/update cart items, calculate totals |
| `CartItemEntity` | id, userId, user, productId, product, quantity, createdAt |

#### Reviews Module (`reviews/`)
Product reviews and ratings.

| Component | Description |
|-----------|-------------|
| `ReviewsController` | GET /reviews, /product/:productId, POST /reviews |
| `ReviewsService` | CRUD for reviews, average rating calculation |

#### Favorites Module (`favorites/`)
User favorite products.

| Component | Description |
|-----------|-------------|
| `FavoritesController` | GET /favorites, POST /favorites/:productId, DELETE /favorites/:productId |
| `FavoritesService` | Add/remove/check favorites |

#### Sections Module (`sections/`)
Homepage content sections.

| Component | Description |
|-----------|-------------|
| `SectionsController` | Full CRUD for homepage sections |
| `SectionsService` | Section management with ordering |
| `SectionEntity` | id, title, subtitle, type, content, order, isActive, createdAt |

#### Pages Module (`pages/`)
Dynamic CMS pages.

| Component | Description |
|-----------|-------------|
| `PagesController` | Full CRUD for static/dynamic pages |
| `PagesService` | Page content management |
| `PageEntity` | id, title, slug, content, metaTitle, metaDescription, isActive, sortOrder, createdAt |

#### Messages Module (`messages/`)
Customer support messaging.

| Component | Description |
|-----------|-------------|
| `MessagesController` | GET /messages, POST /messages, PUT /:id/read |
| `MessagesService` | Message CRUD, read status tracking |
| `MessageEntity` | id, userId, user, subject, message, isRead, createdAt |

#### Notifications Module (`notifications/`)
In-app notification system.

| Component | Description |
|-----------|-------------|
| `NotificationsController` | GET /notifications, POST /notifications, PUT /:id/read |
| `NotificationsService` | Notification creation and delivery |
| `NotificationEntity` | id, userId, title, message, type, isRead, data, createdAt |

#### SEO Module (`seo/`)
SEO metadata management.

| Component | Description |
|-----------|-------------|
| `SeoController` | GET/PUT /seo/global, GET/PUT/DELETE /seo/:pageType/:pageId |
| `SeoService` | SEO metadata CRUD |
| `SeoEntity` | id, pageType, pageId, title, description, keywords, ogImage, canonicalUrl |

#### Settings Module (`settings/`)
Application settings (key-value store).

| Component | Description |
|-----------|-------------|
| `SettingsController` | GET /settings, /:key, PUT /settings/:key |
| `SettingsService` | Settings CRUD with caching |
| `SettingEntity` | id, key, value, type, description, category, createdAt |

---

### Infrastructure Modules

#### Upload Module (`upload-module/`)
File upload handling with Cloudinary and local storage.

| Component | Description |
|-----------|-------------|
| `UploadsController` | POST /upload/image, /file, /3d-model; GET /upload/:filename |
| `UploadsService` | Cloudinary upload, local file management |
| `CloudinaryProvider` | Wraps cloudinary.v2.uploader |

**Upload Endpoints:**
- `/upload/image` - Image upload to Cloudinary
- `/upload/file` - Generic file upload
- `/upload/3d-model` - 3D model file upload (.glb, .gltf, .obj)
- `/upload/:filename` - Serve uploaded files

#### AI Generation Module (`ai-generation/`)
3D model generation via Python worker.

| Component | Description |
|-----------|-------------|
| `AIGenerationController` | POST /ai-generation/3d-model, GET /:id/status |
| `AIGenerationService` | Communicates with Python worker for 3D generation |

**AI Worker Communication:**
- HTTP calls to local Python worker (localhost:8000)
- Supports multiple 3D generation backends
- Tracks generation status (PENDING, IN_PROGRESS, COMPLETED, FAILED)

#### Recommendations Module (`recommendations/`)
Product recommendation engine.

| Component | Description |
|-----------|-------------|
| `RecommendationsController` | GET /recommendations/:productId, /bought-together/:productId |
| `RecommendationsService` | Collaborative filtering and similarity-based recommendations |

#### Email Module (`email/`)
Email sending via Nodemailer.

| Component | Description |
|-----------|-------------|
| `EmailService` | Send order confirmation, password reset, etc. |
| Templates | Order confirmation, welcome email, password reset |

#### Health Module (`health/`)
Application health checks.

| Component | Description |
|-----------|-------------|
| `HealthController` | GET /health, /health/ready |
| `HealthService` | Database connectivity check |

---

## Dependency Graph

```
AppModule
├── ConfigModule (global)
├── DatabaseModule
│   └── TypeORM (SQLite)
├── AuthModule
│   ├── UsersModule
│   ├── Passport (JWT, Local, Google, GitHub)
│   └── @nestjs/config
├── ProductsModule
│   ├── CategoriesModule
│   ├── UploadModule
│   └── AIGenerationModule
├── OrdersModule
│   ├── UsersModule
│   ├── ProductsModule
│   └── PaymentsModule
├── PaymentsModule
│   ├── OrdersModule
│   └── Stripe SDK
├── CartModule
│   ├── UsersModule
│   └── ProductsModule
├── ReviewsModule
│   ├── UsersModule
│   └── ProductsModule
├── FavoritesModule
│   ├── UsersModule
│   └── ProductsModule
├── SectionsModule
├── PagesModule
├── MessagesModule
│   └── UsersModule
├── NotificationsModule
│   └── UsersModule
├── SEOModule
├── SettingsModule
├── UploadModule
│   └── Cloudinary
├── AIGenerationModule
│   └── Python Worker (HTTP)
├── RecommendationsModule
│   └── ProductsModule
├── EmailModule
│   └── Nodemailer
├── HealthModule
├── ThrottlerModule (global)
├── BullModule (global)
└── SwaggerModule (global)
```

---

## REST API Reference

### Authentication

| Method | Route | Guard | Description |
|--------|-------|-------|-------------|
| POST | /auth/login | Public | Login with email/password |
| POST | /auth/register | Public | Register new account |
| POST | /auth/logout | Public | Logout (client-side token removal) |
| GET | /auth/check | Public | Check if JWT is valid |
| GET | /auth/profile | JwtAuthGuard | Get current user profile |
| GET | /auth/oauth/google | Public | Google OAuth2 redirect |
| GET | /auth/oauth/google/callback | Public | Google OAuth2 callback |
| GET | /auth/oauth/github | Public | GitHub OAuth2 redirect |
| GET | /auth/oauth/github/callback | Public | GitHub OAuth2 callback |

### Users

| Method | Route | Guard | Description |
|--------|-------|-------|-------------|
| GET | /users | AdminGuard | List all users |
| GET | /users/:id | AdminGuard | Get user by ID |
| POST | /users | AdminGuard | Create user |
| PUT | /users/:id | AdminGuard | Update user |
| DELETE | /users/:id | AdminGuard | Delete user |

### Products

| Method | Route | Guard | Description |
|--------|-------|-------|-------------|
| GET | /products | Public | List products (paginated) |
| GET | /products/:id | Public | Get product by ID |
| GET | /products/search?q= | Public | Search products |
| GET | /products/categories/:categoryId | Public | Products by category |
| POST | /products | AdminGuard | Create product |
| PUT | /products/:id | AdminGuard | Update product |
| DELETE | /products/:id | AdminGuard | Delete product |
| POST | /products/:id/images | AdminGuard | Add product image |
| GET | /products/:id/views | Public | Get product view stats |

### Categories

| Method | Route | Guard | Description |
|--------|-------|-------|-------------|
| GET | /categories | Public | List categories (tree) |
| GET | /categories/:id | Public | Get category by ID |
| POST | /categories | AdminGuard | Create category |
| PUT | /categories/:id | AdminGuard | Update category |
| DELETE | /categories/:id | AdminGuard | Delete category |

### Orders

| Method | Route | Guard | Description |
|--------|-------|-------|-------------|
| GET | /orders | JwtAuthGuard | List user orders (admin: all) |
| GET | /orders/:id | JwtAuthGuard | Get order by ID |
| POST | /orders | JwtAuthGuard | Create order |
| PUT | /orders/:id/status | AdminGuard | Update order status |

### Payments

| Method | Route | Guard | Description |
|--------|-------|-------|-------------|
| POST | /payments/create-intent | JwtAuthGuard | Create Stripe PaymentIntent |
| POST | /payments/webhook/stripe | Public (signature verified) | Stripe webhook |
| GET | /payments | AdminGuard | List all payments |

### Cart

| Method | Route | Guard | Description |
|--------|-------|-------|-------------|
| GET | /cart | JwtAuthGuard | Get user cart |
| POST | /cart/items | JwtAuthGuard | Add item to cart |
| PUT | /cart/items/:id | JwtAuthGuard | Update cart item quantity |
| DELETE | /cart/items/:id | JwtAuthGuard | Remove item from cart |

### Reviews

| Method | Route | Guard | Description |
|--------|-------|-------|-------------|
| GET | /reviews | Public | List all reviews |
| GET | /reviews/product/:productId | Public | Reviews for product |
| POST | /reviews | JwtAuthGuard | Create review |
| PUT | /reviews/:id | JwtAuthGuard (owner) | Update review |
| DELETE | /reviews/:id | JwtAuthGuard (owner/admin) | Delete review |

### Favorites

| Method | Route | Guard | Description |
|--------|-------|-------|-------------|
| GET | /favorites | JwtAuthGuard | Get user favorites |
| POST | /favorites/:productId | JwtAuthGuard | Add to favorites |
| DELETE | /favorites/:productId | JwtAuthGuard | Remove from favorites |

### Sections

| Method | Route | Guard | Description |
|--------|-------|-------|-------------|
| GET | /sections | Public | List sections |
| GET | /sections/:id | Public | Get section by ID |
| POST | /sections | AdminGuard | Create section |
| PUT | /sections/:id | AdminGuard | Update section |
| DELETE | /sections/:id | AdminGuard | Delete section |

### Pages

| Method | Route | Guard | Description |
|--------|-------|-------|-------------|
| GET | /pages | Public | List pages |
| GET | /pages/:id | Public | Get page by ID |
| GET | /pages/slug/:slug | Public | Get page by slug |
| POST | /pages | AdminGuard | Create page |
| PUT | /pages/:id | AdminGuard | Update page |
| DELETE | /pages/:id | AdminGuard | Delete page |

### Messages

| Method | Route | Guard | Description |
|--------|-------|-------|-------------|
| GET | /messages | JwtAuthGuard | List messages (admin: all) |
| POST | /messages | JwtAuthGuard | Send message |
| PUT | /messages/:id/read | AdminGuard | Mark message as read |

### Notifications

| Method | Route | Guard | Description |
|--------|-------|-------|-------------|
| GET | /notifications | JwtAuthGuard | Get user notifications |
| POST | /notifications | AdminGuard | Create notification |
| PUT | /notifications/:id/read | JwtAuthGuard | Mark as read |

### SEO

| Method | Route | Guard | Description |
|--------|-------|-------|-------------|
| GET | /seo/global | AdminGuard | Get global SEO settings |
| PUT | /seo/global | AdminGuard | Update global SEO |
| GET | /seo/:pageType/:pageId | AdminGuard | Get page SEO |
| PUT | /seo/:pageType/:pageId | AdminGuard | Update page SEO |
| DELETE | /seo/:pageType/:pageId | AdminGuard | Delete page SEO |

### Settings

| Method | Route | Guard | Description |
|--------|-------|-------|-------------|
| GET | /settings | AdminGuard | List all settings |
| GET | /settings/:key | Public | Get setting by key |
| PUT | /settings/:key | AdminGuard | Update setting |

### Upload

| Method | Route | Guard | Description |
|--------|-------|-------|-------------|
| POST | /upload/image | JwtAuthGuard | Upload image to Cloudinary |
| POST | /upload/file | JwtAuthGuard | Upload generic file |
| POST | /upload/3d-model | AdminGuard | Upload 3D model file |
| GET | /upload/:filename | Public | Get uploaded file |

### AI Generation

| Method | Route | Guard | Description |
|--------|-------|-------|-------------|
| POST | /ai-generation/3d-model | AdminGuard | Request 3D model generation |
| GET | /ai-generation/:id/status | AdminGuard | Check generation status |

### Recommendations

| Method | Route | Guard | Description |
|--------|-------|-------|-------------|
| GET | /recommendations/:productId | Public | Get product recommendations |
| GET | /recommendations/bought-together/:productId | Public | Get "bought together" products |

### Health

| Method | Route | Guard | Description |
|--------|-------|-------|-------------|
| GET | /health | Public | Health check |
| GET | /health/ready | Public | Readiness check |

---

## Database Schema

### Entity Relationship Model

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   User      │     │  Category   │     │   Page      │
├─────────────┤     ├─────────────┤     ├─────────────┤
│ id          │     │ id          │     │ id          │
│ email       │     │ name        │     │ title       │
│ username    │     │ slug        │     │ slug        │
│ password    │     │ description │     │ content     │
│ firstName   │     │ parentId ───┼────▶│ parent      │ metaTitle     │
│ lastName    │     │ children ◀──┼────│ metaDescription │
│ phone       │     │ icon        │     │ isActive    │
│ avatar      │     │ bannerImage │     │ sortOrder   │
│ role        │     │ sortOrder   │     └─────────────┘
│ isActive    │     │ isActive    │
└──────┬──────┘     └──────┬──────┘
       │                   │
       │ 1                 N
       │                   │
  ┌────┴─────┐      ┌──────┴──────┐
  │  Order   │      │   Product   │
  ├──────────┤      ├─────────────┤
  │ id       │      │ id          │
  │ userId ──┼──────│ userId      │ name          │
  │ status   │      │ description │
  │ total    │      │ price       │
  │ shipping │      │ oldPrice    │
  │ notes    │      │ currency    │
  │ stripeId │      │ sku         │
  └────┬─────┘      │ stockQty    │
       │            │ weight      │
       │ 1          │ dimensions  │
       │ N          │ categoryId ─┼──────┐
       │            │ model3dUrl  │      │
  ┌────┴─────┐      │ model3dThumb│     N
  │OrderItem │      │ is3dAvailable│    │
  ├──────────┤      │ is3dPrinting│    │
  │ id       │      │ rating      │    │
  │ orderId ─┼──────│ salesCount  │    │
  │ productId│      │ isActive    │    │
  │ quantity │      │ isFeatured  │    │
  │ price    │      │ tags        │    │
  └──────────┘      └──────┬──────┘                           │
       │                   │                                   │
       │ N                 1                                   │
       │                   │                                   │
  ┌────┴─────┐      ┌──────┴──────┐
  │ Product  │◀─────│ Category   │
  └──────────┘      └─────────────┘

┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    Cart     │     │  Review     │     │  Favorite   │
├─────────────┤     ├─────────────┤     ├─────────────┤
│ id          │     │ id          │     │ id          │
│ userId ─────┼────▶│ userId      │     │ userId      │
│ productId ──┼────▶│ productId   │     │ productId ──┼──
│ quantity    │     │ rating      │     └─────────────┘
└─────────────┘     │ comment     │
                    └─────────────┘

┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Payment    │     │  Message    │     │ Notification│
├─────────────┤     ├─────────────┤     ├─────────────┤
│ id          │     │ id          │     │ id          │
│ orderId ────┼────▶│ userId      │     │ userId      │
│ amount      │     │ subject     │     │ title       │
│ currency    │     │ message     │     │ message     │
│ status      │     │ isRead      │     │ type        │
│ stripeId    │     └─────────────┘     │ isRead      │
│ method      │                         │ data        │
└─────────────┘                         └─────────────┘

┌─────────────┐     ┌─────────────┐
│   Section   │     │    SEO      │
├─────────────┤     ├─────────────┤
│ id          │     │ id          │
│ title       │     │ pageType    │
│ subtitle    │     │ pageId      │
│ type        │     │ title       │
│ content     │     │ description │
│ order       │     │ keywords    │
│ isActive    │     │ ogImage     │
└─────────────┘     └─────────────┘

┌─────────────┐
│  Setting    │
├─────────────┤
│ id          │
│ key         │
│ value       │
│ type        │
│ description │
│ category    │
└─────────────┘
```

### Entity Details

#### User
| Field | Type | Decorator | Notes |
|-------|------|-----------|-------|
| id | number | PrimaryGeneratedColumn | Auto-increment |
| email | string | Unique | Email address |
| username | string | Unique | Display name |
| password | string | Select: false | bcrypt hashed |
| firstName | string | nullable | First name |
| lastName | string | nullable | Last name |
| phone | string | nullable | Phone number |
| avatar | string | nullable | Avatar URL |
| role | UserRole | Default: USER | ENUM: USER, ADMIN |
| isActive | boolean | Default: true | Account status |
| createdAt | Date | CreateDateColumn | |
| updatedAt | Date | UpdateDateColumn | |

#### Product
| Field | Type | Decorator | Notes |
|-------|------|-----------|-------|
| id | number | PrimaryGeneratedColumn | Auto-increment |
| name | string | | Product name |
| description | string | nullable | Rich text |
| price | number | | Current price |
| oldPrice | number | nullable | Original price (for discounts) |
| currency | string | Default: USD | Currency code |
| sku | string | Unique | Stock keeping unit |
| stockQuantity | number | Default: 0 | Inventory count |
| weight | number | nullable | Weight in kg |
| dimensions | string | nullable | WxHxL string |
| model3dUrl | string | nullable | 3D model file URL |
| model3dThumbnail | string | nullable | 3D thumbnail URL |
| is3dAvailable | boolean | Default: false | 3D model ready flag |
| is3dPrinting | boolean | Default: false | 3D generation in progress |
| rating | number | Default: 0 | Average rating |
| salesCount | number | Default: 0 | Total sales |
| isActive | boolean | Default: true | Visibility flag |
| isFeatured | boolean | Default: false | Featured product flag |
| tags | string | nullable | Comma-separated tags |
| categoryId | number | | Foreign key |
| category | Category | ManyToOne | Relation |
| images | ProductImage[] | OneToMany | Product images |
| reviews | ProductReview[] | OneToMany | Product reviews |
| createdAt | Date | CreateDateColumn | |
| updatedAt | Date | UpdateDateColumn | |

#### Category
| Field | Type | Decorator | Notes |
|-------|------|-----------|-------|
| id | number | PrimaryGeneratedColumn | Auto-increment |
| name | string | | Category name |
| slug | string | Unique | URL-safe identifier |
| description | string | nullable | Category description |
| parentId | number | nullable | Parent category ID |
| parent | Category | ManyToOne | Self-referencing relation |
| children | Category[] | OneToMany | Sub-categories |
| icon | string | nullable | Icon URL |
| bannerImage | string | nullable | Banner image URL |
| sortOrder | number | Default: 0 | Display order |
| isActive | boolean | Default: true | Visibility flag |

#### Order
| Field | Type | Decorator | Notes |
|-------|------|-----------|-------|
| id | number | PrimaryGeneratedColumn | Auto-increment |
| userId | number | | Foreign key |
| user | User | ManyToOne | Relation |
| status | OrderStatus | Default: PENDING | ENUM status |
| total | number | | Order total |
| shippingAddress | string | nullable | Shipping address JSON |
| notes | string | nullable | Order notes |
| stripePaymentId | string | nullable | Stripe payment ID |
| items | OrderItem[] | OneToMany | Order items |
| createdAt | Date | CreateDateColumn | |

#### Payment
| Field | Type | Decorator | Notes |
|-------|------|-----------|-------|
| id | number | PrimaryGeneratedColumn | Auto-increment |
| orderId | number | | Foreign key (no relation decorator) |
| amount | number | | Payment amount |
| currency | string | Default: USD | Currency code |
| status | string | | Payment status |
| stripePaymentIntentId | string | nullable | Stripe intent ID |
| method | string | nullable | Payment method |
| metadata | string | nullable | JSON metadata |
| createdAt | Date | CreateDateColumn | |

---

## Authentication & Authorization

### Authentication Flow

```
Client                          Backend
  │                               │
  │  POST /auth/login             │
  │  { email, password }          │
  │──────────────────────────────▶│
  │                               │├── LocalStrategy.validate()
  │                               │├── UsersService.findOne()
  │                               │├── bcrypt.compare()
  │                               │└── jwt.sign()
  │                               │
  │◀─────────────────────────────▶│
  │  { access_token, user }       │
  │                               │
  │  GET /protected [Bearer token]│
  │──────────────────────────────▶│
  │                               │├── JwtAuthGuard.canActivate()
  │                               │├── JwtStrategy.validate()
  │                               │└── req.user = payload
  │                               │
```

### OAuth2 Flow (Google/GitHub)

```
Client                          Backend              Provider
  │                               │                       │
  │  GET /auth/oauth/google       │                       │
  │──────────────────────────────▶│                       │
  │                               │├── Redirect to Google │
  │◀─────────────────────────────▶│                       │
  │  (302 Redirect)               │                       │
  │                               │                       │
  │───────────────────────────────▶│  Authorization       │
  │                               │◀──────────────────────│
  │                               │  (code)               │
  │                               │                       │
  │  /auth/oauth/google/callback  │                       │
  │──────────────────────────────▶│                       │
  │                               │├── Exchange code      │
  │                               │──────────────────────▶│
  │                               │◀──────────────────────│
  │                               │  (user profile)       │
  │                               │├── Find/Create User   │
  │                               │└── jwt.sign()         │
  │                               │                       │
  │◀─────────────────────────────▶│                       │
  │  { access_token, user }       │                       │
```

### Authorization

**JwtAuthGuard:**
- Extends `AuthGuard('jwt')`
- Implements `CanActivate`
- Attaches decoded user to `request.user`
- Used on all protected endpoints

**AdminGuard:**
- Implements `CanActivate`
- Checks `user.role === UserRole.ADMIN`
- Used on admin-only endpoints

---

## AI Generation Pipeline

```
Admin Frontend                Backend                    Python Worker
     │                          │                            │
     │  POST /ai-generation/    │                            │
     │  3d-model                │                            │
     │  { productId, images }   │                            │
     │─────────────────────────▶│                            │
     │                          │├── Validate request        │
     │                          │├── Set is3dPrinting=true   │
     │                          │├── HTTP POST               │
     │                          │───────────────────────────▶│
     │                          │                            │├── Receive images
     │                          │                            │├── Run 3D model
     │                          │                            │    generation
     │                          │                            │├── Save .glb file
     │                          │                            │◀───────────────────────────│
     │                          │  { status: 'accepted' }    │                            │
     │◀─────────────────────────│                            │                            │
     │                          │                            │                            │
     │  GET /ai-generation/     │                            │                            │
     │  :id/status              │                            │                            │
     │─────────────────────────▶│                            │                            │
     │                          │├── Check product           │                            │
     │                          │    is3dPrinting flag       │                            │
     │                          │                            │                            │
     │◀─────────────────────────│                            │                            │
     │  { status, progress }    │                            │                            │
```

**Python Worker Stack:**
- Python 3.10+
- PyTorch for deep learning
- Multiple 3D generation backends (Hunyuan3D, InstantMesh, etc.)
- Outputs: .glb files

---

## File Upload Pipeline

```
Client                          Backend                    Cloudinary
  │                               │                           │
  │  POST /upload/image           │                           │
  │  multipart/form-data          │                           │
  │──────────────────────────────▶│                           │
  │                               │├── Multer middleware      │
  │                               │├── Validate file type     │
  │                               │├── cloudinary.uploader   │
  │                               │─────────────────────────▶│
  │                               │◀─────────────────────────│
  │                               │  { secure_url }          │
  │                               │                           │
  │◀─────────────────────────────▶│                           │
  │  { url, publicId }            │                           │
```

**Supported File Types:**
- Images: .jpg, .jpeg, .png, .webp, .gif
- 3D Models: .glb, .gltf, .obj, .stl
- Documents: .pdf, .doc, .docx

**Storage:**
- Primary: Cloudinary (images)
- Secondary: Local filesystem (`uploads/`)
- 3D Models: `uploads/models/`, `uploads/products-3d/`

---

## Payment Flow

```
Client                          Backend                    Stripe
  │                               │                           │
  │  POST /payments/              │                           │
  │  create-intent                │                           │
  │  { amount, currency }         │                           │
  │──────────────────────────────▶│                           │
  │                               │├── stripe.paymentIntents │
  │                               │─────────────────────────▶│
  │                               │◀─────────────────────────│
  │                               │  { client_secret }       │
  │◀─────────────────────────────▶│                           │
  │  { client_secret }            │                           │
  │                               │                           │
  │  ... Client confirms payment  │                           │
  │                               │                           │
  │                               │◀─────────────────────────│
  │                               │  Webhook event            │
  │                               │  payment_intent.succeeded │
  │                               │                           │
  │                               │├── Update Order status    │
  │                               │├── Create Payment record  │
  │                               │├── Send confirmation email│
```

---

## Notification System

Notifications are created programmatically by various services:

- **Order placed**: Notification to admin
- **Order status change**: Notification to user
- **New message**: Notification to admin
- **New review**: Notification to product owner (if applicable)

Delivery methods:
- In-app notifications (database stored)
- Email (via EmailService)

---

## Email System

Email templates:
- **Order Confirmation**: Sent when order is created
- **Welcome Email**: Sent on user registration
- **Password Reset**: Sent when password reset is requested

Configuration:
- SMTP via Nodemailer
- Configured through environment variables

---

## External Integrations

| Integration | Status | Implementation |
|-------------|--------|---------------|
| **Cloudinary** | ✅ Implemented | Image upload and storage |
| **Stripe** | ✅ Implemented | Payment processing via PaymentIntents |
| **Google OAuth** | ✅ Implemented | Passport Google strategy |
| **GitHub OAuth** | ✅ Implemented | Passport GitHub strategy |
| **SMTP Email** | ✅ Implemented | Nodemailer with SMTP transport |
| **Python AI Worker** | ✅ Implemented | HTTP-based 3D generation |
| **Redis** | ⚠️ Configured | BullMQ transport, limited usage |
| **BullMQ** | ⚠️ Configured | Queue infrastructure present |
| **OpenAI** | 🔧 Config only | API key configured, limited usage |
| **Tripo3D** | 🔧 Config only | API key configured |
| **UAV Mapping** | 🔧 Config only | API key configured |
| **Google Maps** | 🔧 Config only | API key configured |
| **Swagger** | ✅ Implemented | API documentation at /api/docs |

---

## Configuration & Environment

### Environment Variables (.env)

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 3000 |
| DATABASE_HOST | Database host | localhost |
| DATABASE_PORT | Database port | 5432 |
| DATABASE_NAME | Database name | ecommerce |
| DATABASE_USERNAME | Database username | postgres |
| DATABASE_PASSWORD | Database password | password |
| DATABASE_IS_ACTIVATED | Enable database sync | true |
| JWT_SECRET | JWT signing secret | (required) |
| JWT_EXPIRATION | Token expiration | 7d |
| CLOUDINARY_CLOUD_NAME | Cloudinary cloud name | (required) |
| CLOUDINARY_API_KEY | Cloudinary API key | (required) |
| CLOUDINARY_API_SECRET | Cloudinary API secret | (required) |
| STRIPE_SECRET_KEY | Stripe secret key | (required) |
| STRIPE_WEBHOOK_SECRET | Stripe webhook secret | (required) |
| STRIPE_PUBLISHABLE_KEY | Stripe publishable key | (required) |
| EMAIL_USER | SMTP email user | (required) |
| EMAIL_CLIENT | SMTP email password/client | (required) |
| FRONTEND_DOMAIN | Frontend URL | http://localhost:4200 |
| AI_WORKER_URL | Python worker URL | http://localhost:8000 |
| GOOGLE_MAPS_API_KEY | Google Maps API key | (optional) |
| OPENAI_API_KEY | OpenAI API key | (optional) |
| TRIPO3D_API_KEY | Tripo3D API key | (optional) |
| UAV_MAPPING_API_KEY | UAV Mapping API key | (optional) |
| ADMIN_EMAIL | Admin notification email | admin@example.com |

---

## Request Lifecycle

```
Browser / Client
      ↓
HTTP Request (with Bearer token if authenticated)
      ↓
Express Server (NestJS underlying platform)
      ↓
┌─────────────────────────────────┐
│  Global Exception Filter        │  Catches all unhandled exceptions
└──────────────┬──────────────────┘
               ↓
┌─────────────────────────────────┐
│  ThrottlerModule                │  Rate limiting (60 req/min default)
└──────────────┬──────────────────┘
               ↓
┌─────────────────────────────────┐
│  Middleware                      │  Logging, CORS, etc.
└──────────────┬──────────────────┘
               ↓
┌─────────────────────────────────┐
│  Interceptors                    │  LoggingInterceptor, TransformInterceptor
└──────────────┬──────────────────┘
               ↓
┌─────────────────────────────────┐
│  Guards                          │  JwtAuthGuard, AdminGuard
└──────────────┬──────────────────┘
               ↓
┌─────────────────────────────────┐
│  Pipes                           │  ValidationPipe, ParseIntPipe
└──────────────┬──────────────────┘
               ↓
┌─────────────────────────────────┐
│  Controller                      │  Route handling, DTO validation
└──────────────┬──────────────────┘
               ↓
┌─────────────────────────────────┐
│  Service                         │  Business logic
└──────────────┬──────────────────┘
               ↓
┌─────────────────────────────────┐
│  Repository (TypeORM)            │  Database queries
└──────────────┬──────────────────┘
               ↓
┌─────────────────────────────────┐
│  SQLite Database                 │  data/database.sqlite
└──────────────┬──────────────────┘
               ↓
Response (JSON)
```

---

## Error Handling

### Global Exception Filter

The application uses a global exception filter that:
- Catches all unhandled exceptions
- Returns consistent error format
- Logs errors for debugging
- Hides internal details in production

**Error Response Format:**
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

### Validation Errors

Uses `class-validator` decorators for DTO validation:
- `@IsEmail()`, `@IsString()`, `@IsNumber()`, etc.
- ValidationPipe throws BadRequestException on failure
- Returns detailed validation error messages

---

## Security

1. **JWT Authentication**: All protected endpoints require valid JWT
2. **Password Hashing**: bcrypt with salt rounds
3. **Role-Based Access**: USER and ADMIN roles
4. **CORS**: Configured for frontend domain
5. **Rate Limiting**: ThrottlerModule prevents abuse
6. **Input Validation**: class-validator on all DTOs
7. **HTTPS**: Required in production for Stripe webhooks

---

## Performance

1. **Database Indexes**: On frequently queried columns (email, username, slug)
2. **Query Optimization**: Select only needed fields where possible
3. **Caching**: Settings cached in memory
4. **Pagination**: List endpoints support skip/take parameters

---

## Known Technical Debt

1. **Payment Entity**: Uses `orderId` as plain number instead of TypeORM relation to Order
2. **Notification Entity**: Has `userId` but no @ManyToOne relation defined
3. **CartItem Entity**: References User and Product via plain IDs without cascade delete in some cases
4. **DTO Validation**: Some DTOs lack comprehensive validation decorators
5. **Error Handling**: Inconsistent across controllers (some use try-catch, some rely on global filter)
6. **Rate Limiting**: Default throttling may not be sufficient for production
7. **Swagger Documentation**: Configured but may not cover all endpoints
8. **Redis/BullMQ**: Queue infrastructure exists but limited actual queue-based processing
9. **Circular Dependencies**: None detected, but module coupling could be reduced
10. **Service Size**: Some services (ProductsService) handle too many responsibilities

---

## Future Improvements

1. **Database Migration**: Migrate from SQLite to PostgreSQL for production
2. **Caching Layer**: Implement Redis caching for frequently accessed data
3. **Queue Processing**: Move email sending and AI generation to BullMQ queues
4. **Microservices**: Consider splitting AI generation into separate microservice
5. **API Versioning**: Add version prefix to API routes
6. **GraphQL**: Consider GraphQL for complex queries
7. **WebSocket**: Real-time notifications via WebSocket
8. **Search Engine**: Integrate Elasticsearch for product search
9. **Analytics**: Add request analytics and monitoring
10. **Testing**: Increase unit and integration test coverage

---

*Document generated from source code analysis. For the machine-readable model, see `docs/backend-architecture.json`.*