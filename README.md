# 🛍️ Angular E-commerce 3D Platform

**Modern e-commerce platform with 3D product visualization, AI image processing, and comprehensive admin panel.**

## ✨ Key Features

### 🎨 **Storefront**
- **3D Product Visualization** with Three.js
- **Glassmorphism Design** with Liquid Glass system
- **Responsive Design** (mobile-first approach)
- **Contact Form** with backend integration
- **Favorites/Wishlist** functionality
- **Shopping Cart** with real-time updates
- **Dynamic Theming** system

### 🔧 **Admin Panel**
- **Product Management** with 3D model support
- **Category Management** with dynamic icons
- **Order Management** with status tracking
- **User Management** with role-based access
- **Message Management** for contact form
- **Section Management** for homepage customization
- **Image Processing** with AI background removal

### 🖼️ **Image Processing**
- **AI Background Removal** using Remove.bg API
- **JPG to PNG Conversion** with transparency
- **Drag & Drop** interface
- **Before/After Preview**

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL (optional - in-memory storage available)
- Remove.bg API key (for image processing)

### Installation

1. **Install dependencies**
```bash
npm install
cd backend && npm install
```

2. **Environment setup**
```bash
# Copy and configure environment files
cp backend/.env.example backend/.env
```

3. **Start development servers**
```bash
# Frontend (port 4200)
npm start

# Backend (port 3000)
cd backend && npm run start:dev
```

4. **Access the application**
- Frontend: http://localhost:4200
- Admin Panel: http://localhost:4200/admin
- Backend API: http://localhost:3000/api

## 📁 Project Structure

```
angular-ecommerce-3d/
├── src/                    # Frontend (Angular)
│   ├── admin/             # Admin panel components
│   ├── app/               # Main application
│   │   ├── components/    # Storefront components
│   │   ├── core/          # Core services
│   │   ├── layout/        # Layout components
│   │   ├── pages/         # Storefront pages
│   │   └── shared/        # Shared components
│   └── styles/            # Global styles
├── backend/               # Backend (NestJS)
│   ├── src/               # Backend modules
│   └── uploads/           # File storage
└── docs/                  # Documentation
```

## 🎨 Design System

### **Liquid Glass System**
- CSS variables for easy theming
- Glassmorphism effects with backdrop filters
- Responsive grid system
- Component library with consistent styling

### **Admin UI System**
- Material Design based components
- Dark theme with consistent styling
- Error handling with beautiful dialogs

## 🔧 Configuration

### Environment Variables
```bash
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=ecommerce_db

# JWT
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d

# APIs
REMOVE_BG_API_KEY=your-remove-bg-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## 📱 Responsive Design

- **Mobile-first** approach
- **Breakpoint system** for all devices
- **Touch-friendly** interfaces
- **Performance optimized** for mobile

## 🔒 Security

- **JWT Authentication**
- **Role-based Access Control**
- **Input Validation**
- **File Upload Security**
- **CORS Configuration**

## 🚀 Deployment

### Frontend
```bash
ng build --prod
```

### Backend
```bash
npm run build
npm run start:prod
```

## 📚 Documentation

- [Installation Guide](./INSTALLATION.md)
- [Features Overview](./FEATURES.md)
- [Admin UI System](./README_ADMIN_UI_SYSTEM.md)
- [Image Processing](./README_IMAGE_PROCESSING.md)
- [Backend API](./backend/README.md)

## 🆘 Support

- Create an issue in the repository
- Check the documentation
- Review existing issues

## 📄 License

This project is licensed under the MIT License.

---

**🎉 Built with Angular, NestJS, and Three.js**
