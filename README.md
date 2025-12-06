# 🛍️ Angular E-commerce 3D Platform

<div align="center">

![Angular](https://img.shields.io/badge/Angular-17+-DD0031?style=for-the-badge&logo=angular)
![NestJS](https://img.shields.io/badge/NestJS-10+-E0234E?style=for-the-badge&logo=nestjs)
![Three.js](https://img.shields.io/badge/Three.js-3D-000000?style=for-the-badge&logo=three.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?style=for-the-badge&logo=typescript)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**Modern full-stack e-commerce platform with 3D product visualization, AI image processing, and comprehensive admin panel.**

[Demo](https://demo.angular-ecommerce3d.com) • [Documentation](docs/) • [Support](SUPPORT.md)

</div>

---

## ✨ Key Features

### 🎮 3D Product Visualization
- **Three.js Integration** - Realistic 3D product models
- **Interactive Viewer** - Zoom, rotate, pan controls
- **GLTF/GLB Support** - Industry-standard 3D formats
- **Mobile Optimized** - Touch gestures support

### 🎨 4 Premium Themes
- **Light Theme** - Clean, minimal design
- **Dark Theme** - Modern dark mode
- **Glass Theme** - Glassmorphism effects
- **Dark Glass Theme** - Apple-inspired liquid glass

### 💳 Payment Integration
- **Stripe** - Cards, Apple Pay, Google Pay
- **PayPal** - Global payments
- **LiqPay** - Eastern Europe support

### 🖼️ AI Image Processing
- **Background Removal** - Remove.bg API integration
- **Auto Optimization** - WebP conversion, compression
- **Cloudinary Storage** - CDN delivery

### 🛠️ Admin Panel
- **Dashboard** - Sales analytics, charts
- **Product Management** - CRUD, 3D model upload
- **Order Management** - Status tracking
- **User Management** - Roles, permissions
- **SEO Settings** - Meta tags, sitemap

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

```bash
# Clone repository
git clone https://github.com/your-username/angular-ecommerce-3d.git
cd angular-ecommerce-3d

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend && npm install && cd ..

# Configure environment
cp src/environments/environment.example.ts src/environments/environment.ts
cp backend/.env.example backend/.env
# Edit .env with your credentials

# Start development servers
npm run start          # Frontend: http://localhost:4200
cd backend && npm run start:dev  # Backend: http://localhost:3002
```

### Docker (Recommended)

```bash
# Start all services
docker-compose up -d

# Access
# Frontend: http://localhost:4200
# Backend API: http://localhost:3002
# PostgreSQL: localhost:5432
```

---

## 📁 Project Structure

```
angular-ecommerce-3d/
├── src/                    # Frontend (Angular)
│   ├── app/
│   │   ├── components/     # Shared components
│   │   ├── pages/          # Page components
│   │   ├── core/           # Services, guards
│   │   └── shared/         # UI components
│   ├── admin/              # Admin panel module
│   ├── assets/             # Static assets, 3D models
│   └── styles/             # SCSS, themes
├── backend/                # Backend (NestJS)
│   └── src/
│       ├── auth/           # Authentication
│       ├── products/       # Product CRUD
│       ├── orders/         # Order management
│       ├── payments/       # Payment processing
│       └── upload-module/  # File uploads
├── docker-compose.yml      # Docker configuration
└── README.md
```

---

## 🎨 Themes

| Light | Dark | Glass | Dark Glass |
|-------|------|-------|------------|
| Clean minimal design | Modern dark mode | Glassmorphism effects | Apple-inspired liquid glass |

Switch themes in Admin Panel → Settings → Appearance.

---

## 💳 Payment Setup

### Stripe
1. Get API keys from [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Add to `backend/.env`:
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### PayPal
1. Create app at [PayPal Developer](https://developer.paypal.com/dashboard)
2. Add credentials to `.env`

### LiqPay
1. Register at [LiqPay](https://www.liqpay.ua/)
2. Add public/private keys to `.env`

---

## 🖼️ Image Processing Setup

### Remove.bg (Background Removal)
1. Get API key from [Remove.bg](https://www.remove.bg/api)
2. Add to `backend/.env`:
```env
REMOVE_BG_API_KEY=your_api_key
```

### Cloudinary (Image Storage)
1. Create account at [Cloudinary](https://cloudinary.com/)
2. Add credentials to `.env`:
```env
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

---

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_HOST` | PostgreSQL host | Yes |
| `DATABASE_PASSWORD` | Database password | Yes |
| `JWT_SECRET` | JWT signing key | Yes |
| `STRIPE_SECRET_KEY` | Stripe API key | Yes |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud | No |
| `REMOVE_BG_API_KEY` | Remove.bg API | No |

See `backend/.env.example` for full list.

---

## 📦 Build & Deploy

### Production Build

```bash
# Frontend
npm run build -- --configuration production

# Backend
cd backend && npm run build
```

### Deploy to Render

1. Connect GitHub repository
2. Configure environment variables
3. Deploy frontend as Static Site
4. Deploy backend as Web Service

See `render.yaml` for configuration.

---

## 🧪 Testing

```bash
# Frontend tests
npm run test

# Backend tests
cd backend && npm run test

# E2E tests
npm run e2e
```

---

## 📄 API Documentation

API documentation available at `/api/docs` when `ENABLE_SWAGGER=true`.

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List products |
| POST | `/api/products` | Create product |
| GET | `/api/orders` | List orders |
| POST | `/api/payments/stripe` | Process Stripe payment |
| POST | `/api/auth/login` | Admin login |

---

## 🤝 Support

- 📧 Email: support@angular-ecommerce3d.com
- 📖 [Documentation](docs/)
- 🐛 [Issues](https://github.com/your-username/angular-ecommerce-3d/issues)

---

## 📜 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file.

---

## 🙏 Credits

Built with:
- [Angular](https://angular.io/)
- [NestJS](https://nestjs.com/)
- [Three.js](https://threejs.org/)
- [Angular Material](https://material.angular.io/)
- [TypeORM](https://typeorm.io/)

---

<div align="center">

**[⬆ Back to Top](#-angular-e-commerce-3d-platform)**

Made with ❤️ for the developer community

</div>
