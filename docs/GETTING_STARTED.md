# Getting Started Guide

Welcome to the **Angular 3D E-commerce Platform**! This guide will help you get the project up and running in your development environment.

## 🏁 Prerequisites

Ensure you have the following installed:
- **Node.js**: v18.x or higher (v20 recommended)
- **npm**: v9.x or higher
- **PostgreSQL**: v14.x or higher
- **Angular CLI**: v17.x

## 📥 Installation

1. **Clone and Install Dependencies**:
   ```bash
   git clone <your-repo-url>
   cd angular-ecommerce-3d
   npm install
   ```

2. **Backend Setup**:
   ```bash
   cd backend
   npm install
   ```

## ⚙️ Environment Configuration

### Backend (`backend/.env`)
Create a `.env` file in the `backend/` directory:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=ecommerce_db
JWT_SECRET=your_super_secret_key
STRIPE_SECRET_KEY=sk_test_...
```

### Frontend (`src/environments/environment.ts`)
The project uses an **Intelligent API Fallback**. By default, it tries to connect to `http://localhost:3002/api`. If it's not available, it automatically switches to the production fallback.

## 🚀 Running the Project

### Development Mode (CSR)
This is for standard client-side development:
```bash
# Terminal 1: Backend
cd backend && npm run start:dev

# Terminal 2: Frontend
npm start
```

### SSR Mode (Server-Side Rendering)
To test the production-like SSR behavior locally:
```bash
npm run serve:ssr:dev
```
This command builds both the frontend and the server and starts the SSR engine on `http://localhost:4000` (or similar).

## 🗄️ Database Migrations
The project uses TypeORM. Migrations run automatically on startup in development mode, but you can manage them manually:
```bash
cd backend
npm run migration:run
```
