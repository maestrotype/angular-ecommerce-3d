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
npm install   # installs frontend + backend (npm workspaces)
```

### 2. Configure Backend
```bash
cd backend
cp .env.example .env # Ensure variables are correctly mapped
```

> **Note:** A single `npm install` at the repo root installs both the Angular app and the NestJS backend. You no longer need `cd backend && npm install` for local development.

## Environment Configuration

### Backend (.env)
The NestJS backend requires a `.env` file in the `backend/` directory.
- `DATABASE_HOST`: Database host address (`localhost` for local dev; Docker overrides to `postgres`).
- `DATABASE_PORT`: Default is 5432.
- `DATABASE_PASSWORD`: Password for the PostgreSQL user.
- `JWT_SECRET`: Secret key for signing authentication tokens (min 32 characters).
- `ADMIN_EMAIL` / `ADMIN_PASSWORD`: Used by `POST /api/auth/create-admin` to bootstrap the admin user.

### Frontend (environment.ts)
The application implements an **Initial API Verification** logic via `ApiConfigService`. 
- `apiUrl`: Target local endpoint (`http://localhost:3002/api`).
- `fallbackApiUrl`: Production endpoint for failover when local services are unreachable during development.

### Integrations (Admin Panel)
The platform uses external services to enhance capabilities. Configure these in the Admin Panel (`/admin/integrations`):
1. **Tripo3D (AI Generation)**: Requires a Tripo3D API Key (starts with `tsk_...`). Register at [platform.tripo3d.ai](https://platform.tripo3d.ai). Used for transforming 2D images to 3D `.glb` models.
2. **Cloudinary**: For reliable remote asset hosting (Optional).
3. **Stripe & SMTP**: For payments and email notifications.

## Execution

### Development (Client-Side Rendering)
Standard development mode with HMR (Hot Module Replacement) support.
```bash
# Terminal 1: API Service
npm run backend:start:dev

# Terminal 2: UI Service
npm start
```

Equivalent from the `backend/` folder (still works):

```bash
cd backend && npm run start:dev
```

### SSR Verification (Local)
To validate Server-Side Rendering and Hydration behavior before deployment:
```bash
npm run serve:ssr:dev
```
This runs a production browser + server build, then serves via `server-simple.mjs` on **http://localhost:4000** (matches Playwright e2e).

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
TypeORM synchronizes the schema automatically on startup (`synchronize: true` in `database.config.ts`). For production hardening beyond the marketplace template, add explicit migrations before go-live.

## Admin Bootstrap

There are **no hardcoded admin credentials**. Set in `backend/.env`:

```env
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=YourSecurePassword123!
```

Then create the admin user:

```bash
curl -X POST http://localhost:3002/api/auth/create-admin
```

### Demo products (optional)

Populate the catalog with bundled local assets (no Unsplash URLs):

```bash
npm run backend:seed
npm run demo:models   # optional: avocado + water-bottle GLB (~17 MB)
```

For production bootstrap, see [First Deploy Security Checklist](INSTALLATION.md#-first-deploy-security-checklist).

### API documentation (Swagger)

With the backend running:

- Swagger UI: `http://localhost:3002/api/docs`
- OpenAPI JSON: `http://localhost:3002/api/docs-json`
