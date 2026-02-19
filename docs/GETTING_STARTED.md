# Getting Started

This document details the configuration and deployment steps required to initialize the development and production environments.

## System Dependencies

| Component | Requirement |
|-----------|-------------|
| Node.js | v18.13.0+ (LTS recommended) |
| npm | v9.0.0+ |
| PostgreSQL | v14.0+ |
| Angular CLI | v17.0+ |

## Installation

### 1. Initialize Workspace
```bash
git clone <repository-url>
cd angular-ecommerce-3d
npm install
```

### 2. Configure Backend
```bash
cd backend
npm install
cp .env.example .env # Ensure variables are correctly mapped
```

## Environment Configuration

### Backend (.env)
The NestJS backend requires a `.env` file for database connectivity and security.
- `DB_HOST`: Database host address.
- `DB_PORT`: Default is 5432.
- `DB_PASSWORD`: Password for the PostgreSQL user.
- `JWT_SECRET`: Secret key for signing authentication tokens.

### Frontend (environment.ts)
The application implements an **Initial API Verification** logic via `ApiConfigService`. 
- `apiUrl`: Target local endpoint (`http://localhost:3002/api`).
- `fallbackApiUrl`: Production endpoint for failover when local services are unreachable during development.

## Execution

### Development (Client-Side Rendering)
Standard development mode with HMR (Hot Module Replacement) support.
```bash
# Terminal 1: API Service
cd backend && npm run start:dev

# Terminal 2: UI Service
npm start
```

### SSR Verification (Local)
To validate Server-Side Rendering and Hydration behavior before deployment:
```bash
npm run serve:ssr:dev
```
This script triggers a multi-stage build using `@angular-devkit/build-angular:server` and executes the node-rendered bundle via `server-simple.mjs`.

## Deployment

The project supports multiple deployment architectures. Choose the one that matches your hosting provider.

### 🚀 Recommended: SSR + PWA (Cloud/Node.js)
Ideal for maximum SEO and mobile performance.
```bash
npm run deploy
```
*Creates both browser and server bundles in `dist/`. Ready for deployment to platforms like Render, Railway, or VPS.*

### ☁️ Legacy: CSR (GitHub Pages)
For static hosting without Server-Side Rendering.
```bash
npm run deploy:legacy
```

### 🎯 Component-Specific Builds
- **Just SSR**: `npm run deploy:ssr`
- **Just PWA (CSR)**: `npm run deploy:pwa`

## Database Management
TypeORM handles the schema synchronization. In production, use manual migrations:
```bash
cd backend
npm run migration:run
```
Default Admin Credentials: `admin@example.com` / `admin123`.
