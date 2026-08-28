# 📦 Installation Guide

Complete installation guide for Angular E-commerce 3D platform.

---

## 📋 Table of Contents

1. [System Requirements](#system-requirements)
2. [Development Installation](#development-installation)
3. [Production Installation](#production-installation)
4. [Docker Installation](#docker-installation)
5. [Database Setup](#database-setup)
6. [Environment Configuration](#environment-configuration)
7. [First Run Setup](#first-run-setup)
8. [Troubleshooting](#troubleshooting)

---

## 💻 System Requirements

### Minimum Requirements

| Component | Requirement |
|-----------|------------|
| **Operating System** | Windows 10+, macOS 10.14+, Ubuntu 18.04+ |
| **Node.js** | 18.0 or higher |
| **npm** | 9.0 or higher |
| **PostgreSQL** | 14.0 or higher |
| **RAM** | 4 GB minimum, 8 GB recommended |
| **Storage** | 2 GB free space |
| **Browser** | Chrome 90+, Firefox 88+, Safari 14+, Edge 90+ |

### Optional (Recommended)

- **Git** - For version control
- **Docker** - For containerized deployment
- **Visual Studio Code** - Recommended IDE

---

## 🚀 Development Installation

### Step 1: Install Prerequisites

#### Install Node.js

1. Download from [nodejs.org](https://nodejs.org/)
2. Choose LTS version (18.x or higher)
3. Run installer with default settings
4. Verify installation:

```bash
node --version  # Should show v18.x.x or higher
npm --version   # Should show 9.x.x or higher
```

#### Install PostgreSQL

**Windows:**
1. Download from [postgresql.org](https://www.postgresql.org/download/windows/)
2. Run installer, remember your password
3. Default port: 5432

**macOS:**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Linux (Ubuntu):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

Verify installation:
```bash
psql --version  # Should show 14.x or higher
```

### Step 2: Download Project

Extract the purchased zip file:

```bash
unzip angular-ecommerce-3d.zip
cd angular-ecommerce-3d
```

### Step 3: Install Dependencies (frontend + backend)

```bash
npm install   # npm workspaces — installs Angular app and NestJS backend
```

**Expected output:**
```
added 1234 packages in 45s
```

> **Note:** A separate `cd backend && npm install` is no longer required. The repo uses npm workspaces with a single root lockfile.

---

## 🗄️ Database Setup

### Step 1: Create Database

#### Using pgAdmin (GUI)

1. Open pgAdmin 4
2. Right-click "Databases" → "Create" → "Database"
3. Name: `ecommerce_db`
4. Owner: `postgres`
5. Click "Save"

#### Using Command Line

**macOS/Linux:**
```bash
sudo -u postgres psql
CREATE DATABASE ecommerce_db;
\q
```

**Windows (as postgres user):**
```bash
psql -U postgres
CREATE DATABASE ecommerce_db;
\q
```

### Step 2: Verify Database

```bash
psql -U postgres -l
```

You should see `ecommerce_db` in the list.

---

## ⚙️ Environment Configuration

### Backend Configuration

#### Step 1: Create Environment File

```bash
cp backend/.env.example backend/.env
```

#### Step 2: Edit Configuration

Open `backend/.env` in a text editor and configure:

```env
# APPLICATION
NODE_ENV=development
PORT=3002
FRONTEND_URL=http://localhost:4200

# DATABASE
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_actual_password_here
DATABASE_NAME=ecommerce_db

# JWT (Generate a secure secret!)
JWT_SECRET=generate_a_random_32_character_secret_key_here
JWT_EXPIRES_IN=7d

# Admin bootstrap (for POST /api/auth/create-admin)
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=change_me_min_12_chars
ADMIN_NAME=Admin User
ADMIN_BOOTSTRAP_TOKEN=generate_a_random_one_time_token

# OPTIONAL: Payment Gateways (can configure later)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# OPTIONAL: Image Storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# OPTIONAL: Background Removal
REMOVE_BG_API_KEY=your_remove_bg_api_key
```

> **🔐 Generate JWT Secret:**
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

### Frontend Configuration

For development, the default configuration works out of the box.

For production, edit `src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-backend-api.com/api',
  stripePublishableKey: '',  // configure in Admin → Settings
  paypalClientId: '',        // configure in Admin → Settings
};
```

> Payment keys are loaded from the Admin Panel at runtime. Keep environment payment fields **empty** in production builds unless you intentionally inject build-time fallbacks.

---

## 🔐 First Deploy Security Checklist

Complete this before exposing the app to the public internet.

| Step | Action |
|------|--------|
| 1 | Set a unique `JWT_SECRET` (≥32 chars). Production **refuses to start** with placeholder values. |
| 2 | Set strong `ADMIN_EMAIL` / `ADMIN_PASSWORD` (≥12 chars) in `backend/.env`. |
| 3 | Bootstrap admin once: `POST /api/auth/create-admin` (dev) or with `x-admin-bootstrap-token` header (production). |
| 4 | Generate `ADMIN_BOOTSTRAP_TOKEN` for production bootstrap, then remove or rotate it after first admin exists. |
| 5 | Do **not** pre-fill admin login credentials in frontend environment files. |
| 6 | Configure Stripe/PayPal in Admin → Settings — do not ship mock payment keys in `environment.prod.ts`. |
| 7 | For Docker: fill `backend/.env` before `docker compose up` (Compose loads it via `env_file`). |
| 8 | Change default PostgreSQL credentials in production. |

### Production admin bootstrap

```bash
curl -X POST https://your-api.example.com/api/auth/create-admin \
  -H "x-admin-bootstrap-token: YOUR_ADMIN_BOOTSTRAP_TOKEN"
```

Requires `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and matching `ADMIN_BOOTSTRAP_TOKEN` in backend environment.

---

## 🎬 First Run Setup

### Step 1: Start Backend

Open a terminal:

```bash
npm run backend:start:dev
```

**Expected output:**
```
[Nest] 12345  - INFO [NestFactory] Starting Nest application...
[Nest] 12345  - INFO [InstanceLoader] AppModule dependencies initialized
[Nest] 12345  - INFO [RoutesResolver] ProductsController {/api/products}
...
[Nest] 12345  - INFO Application is running on: http://localhost:3002
```

> ✅ **Success Indicator**: You should see "Application is running on: http://localhost:3002"

### Step 2: Create Admin User

1. Add bootstrap credentials to `backend/.env` (see `backend/.env.example`):

```env
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=YourSecurePassword123!
ADMIN_NAME=Admin User
```

2. While the backend is running, open a **new terminal**:

```bash
curl -X POST http://localhost:3002/api/auth/create-admin
```

**Expected response:** JSON user object with your `ADMIN_EMAIL`.

> **Security:** Credentials come from `.env` — there are no hardcoded default passwords. Use at least 12 characters for `ADMIN_PASSWORD`.

### Step 3: Start Frontend

In a **new terminal**:

```bash
npm start
```

**Expected output:**
```
** Angular Live Development Server is listening on localhost:4200 **
✔ Compiled successfully.
```

> ✅ **Success Indicator**: Browser should automatically open to http://localhost:4200

### Step 4: Verify Installation

1. Open http://localhost:4200 — You should see the homepage
2. Navigate to http://localhost:4200/admin
3. Login with the `ADMIN_EMAIL` / `ADMIN_PASSWORD` from your `backend/.env`
4. You should see the admin dashboard

**🎉 Success!** Your development environment is ready!

---

## 🌍 Production Installation

### Option 1: Manual Deployment

#### Build Frontend

```bash
npm run build:prod
```

Output will be in `dist/angular-ecommerce-3d/` directory.

#### Build Backend

```bash
npm run backend:build
```

Output will be in `backend/dist/` directory.

#### Deploy

1. Upload `dist/` folder to your web server (nginx/Apache)
2. Upload `backend/dist/` to Node.js server
3. Set up PostgreSQL database on server
4. Configure environment variables
5. Start backend: `npm run start:prod`

### Option 2: Docker Deployment

See [Docker Installation](#docker-installation) section.

### Option 3: Cloud Platforms

#### Deploy to Render.com

1. Connect GitHub repository
2. Create Web Service for backend
3. Create Static Site for frontend
4. Add environment variables in dashboard
5. Deploy

#### Deploy to Heroku

```bash
# Backend
heroku create your-app-backend
heroku addons:create heroku-postgresql:hobby-dev
git push heroku main

# Frontend
heroku create your-app-frontend
heroku buildpacks:add heroku/nodejs
git push heroku main
```

---

## 🐳 Docker Installation

### Prerequisites

- Docker Desktop installed
- Docker Compose installed

### Step 1: Configure Environment

```bash
cp backend/.env.example backend/.env
# Edit backend/.env — set JWT_SECRET, DATABASE_PASSWORD, ADMIN_EMAIL, ADMIN_PASSWORD
```

> Docker Compose loads `backend/.env` via `env_file`. You do not need a separate root `.env` unless overriding postgres credentials (see root `.env.example`).

### Step 2: Start Services

```bash
docker compose up -d --build
```

This will:
- ✅ Start PostgreSQL container
- ✅ Start backend container (NestJS on port 3002)
- ✅ Start frontend container (nginx CSR on port 4200)
- ✅ Auto-create database schema via TypeORM on backend startup

### Step 3: Access Application

- Frontend: http://localhost:4200
- Backend API: http://localhost:3002/api
- Database: localhost:5432

### Step 4: Create Admin User

Ensure `ADMIN_EMAIL` and `ADMIN_PASSWORD` are set in `backend/.env`, then:

```bash
curl -X POST http://localhost:3002/api/auth/create-admin
```

In production, pass `x-admin-bootstrap-token` header — see [First Deploy Security Checklist](#-first-deploy-security-checklist).

### Useful Docker Commands

```bash
# View logs
docker compose logs -f

# Stop services
docker compose down

# Rebuild after code changes
docker compose up -d --build

# Access database
docker compose exec postgres psql -U postgres ecommerce_db
```

---

## 🔧 Advanced Configuration

### SSL/HTTPS Setup

For production, configure SSL certificate:

**nginx configuration:**
```nginx
server {
    listen 443 ssl;
    server_name yourdomain.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    location / {
        proxy_pass http://localhost:4200;
    }
    
    location /api {
        proxy_pass http://localhost:3002;
    }
}
```

### Custom Domain

1. Point your domain to server IP
2. Update `FRONTEND_URL` in `backend/.env`
3. Update `apiUrl` in frontend environment files
4. Configure CORS in backend

### Email Configuration

For order notifications, configure SMTP:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

---

## 🛠️ Troubleshooting

### Issue: "npm install" fails

**Solution:**
```bash
# Clear npm cache
npm cache clean --force
# Remove node_modules
rm -rf node_modules package-lock.json
# Reinstall
npm install
```

### Issue: Database connection error

**Symptoms:**
```
[TypeORM] Connection failed: password authentication failed
```

**Solution:**
1. Verify PostgreSQL is running:
   ```bash
   # macOS/Linux
   sudo systemctl status postgresql
   # or
   brew services list
   ```
2. Check credentials in `backend/.env`
3. Test connection manually:
   ```bash
   psql -U postgres -d ecommerce_db
   ```

### Issue: Port already in use

**Symptoms:**
```
Port 4200 is already in use
```

**Solution:**
```bash
# Find process using port
lsof -i :4200  # macOS/Linux
netstat -ano | findstr :4200  # Windows

# Kill process or use different port
npm start -- --port 4300
```

### Issue: 3D models not loading

**Solution:**
1. Check file format (must be .glb or .gltf)
2. Verify file size (< 10MB recommended)
3. Check browser console for errors
4. Ensure CORS is configured correctly

### Issue: Payment integration not working

**Solution:**
1. Verify API keys in `backend/.env`
2. Check you're using test keys in development
3. Enable Stripe webhooks
4. Check firewall/network settings

---

## 📊 Performance Optimization

### Production Checklist

- [ ] Enable gzip compression
- [ ] Configure CDN for static assets
- [ ] Set up Redis for caching
- [ ] Enable database connection pooling
- [ ] Configure image optimization
- [ ] Set up monitoring (e.g., PM2)

### Recommended PM2 Configuration

```bash
# Install PM2
npm install -g pm2

# Start backend with PM2
cd backend
pm2 start dist/main.js --name ecommerce-backend

# Save PM2 configuration
pm2 save
pm2 startup
```

---

## 📚 Next Steps

After successful installation:

1. ✅ [Configure Admin Panel](ADMIN_MANUAL.md)
2. ✅ [Customize Your Store](CUSTOMIZATION.md)
3. ✅ [Set Up Payments](PAYMENT_SETUP.md)
4. ✅ [Review FAQ](FAQ.md)

---

## 🆘 Support

Need help with installation?

- 📧 Email: support@angular-ecommerce3d.com
- 📖 Check [FAQ](FAQ.md)
- 🐛 GitHub Issues (if applicable)

---

**Installation Guide Version**: 1.0  
**Last Updated**: January 2026
