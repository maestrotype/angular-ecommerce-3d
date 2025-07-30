# 🛍️ Angular E-commerce 3D Platform

A modern e-commerce platform built with Angular, NestJS, and Three.js featuring 3D product visualization, image processing, and comprehensive admin panel.

## ✨ Features

### 🎨 **Storefront**
- **3D Product Visualization** with Three.js
- **Responsive Design** with glassmorphism effects
- **Multi-language Support** (EN, RU, UA)
- **Advanced Image Processing** with background removal
- **Dynamic Theming System**
- **Favorites/Wishlist** functionality
- **Shopping Cart** with real-time updates

### 🔧 **Admin Panel**
- **Modern UI System** with consistent design
- **Image Processing** with AI background removal
- **Product Management** with 3D model support
- **Category Management** with dynamic icons
- **Order Management** with status tracking
- **User Management** with role-based access
- **Section Management** for homepage customization
- **Error Handling** with beautiful dialogs

### 🖼️ **Image Processing**
- **AI Background Removal** using Remove.bg API
- **JPG to PNG Conversion** with transparency
- **Image Optimization** for web use
- **Drag & Drop** interface
- **Before/After Preview**
- **Batch Processing** support

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL
- Remove.bg API key (for image processing)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd angular-ecommerce-3d
```

2. **Install dependencies**
```bash
# Frontend
npm install

# Backend
cd backend
npm install
```

3. **Environment setup**
```bash
# Backend .env
cp backend/.env.example backend/.env
# Add your database and API keys
```

4. **Start development servers**
```bash
# Frontend (port 4200)
ng serve

# Backend (port 3000)
cd backend
npm run start:dev
```

## 📁 Project Structure

```
angular-ecommerce-3d/
├── src/                    # Frontend (Angular)
│   ├── admin/             # Admin panel
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Admin pages
│   │   ├── services/      # Admin services
│   │   └── styles/        # Admin UI system
│   ├── app/               # Main application
│   │   ├── components/    # Storefront components
│   │   ├── core/          # Core services
│   │   ├── layout/        # Layout components
│   │   └── pages/         # Storefront pages
│   └── shared/            # Shared models
├── backend/               # Backend (NestJS)
│   ├── src/
│   │   ├── auth/          # Authentication
│   │   ├── categories/    # Category management
│   │   ├── products/      # Product management
│   │   ├── orders/        # Order management
│   │   ├── sections/      # Section management
│   │   ├── upload-module/ # File uploads
│   │   └── services/      # Shared services
│   └── uploads/           # Uploaded files
└── docs/                  # Documentation
```

## 🎨 UI Systems

### **Storefront UI System**
- **Glassmorphism Design** with backdrop filters
- **Dynamic Theming** (Default, Glass, Modern)
- **Responsive Grid** system
- **Component Library** with consistent styling

### **Admin UI System**
- **Material Design** based components
- **CSS Variables** for easy theming
- **Mixins** for reusable styles
- **Error Handling** with beautiful dialogs

## 🖼️ Image Processing

### **Features**
- **AI Background Removal** using Remove.bg
- **Format Conversion** (JPG → PNG)
- **Image Optimization** with Sharp
- **Cloudinary Integration** for storage

### **Usage**
```typescript
// In components
<app-image-processor
  [control]="imageControl"
  [processingOptions]="options"
  (fileProcessed)="onProcessed($event)">
</app-image-processor>
```

## 🔧 Error Handling

### **Centralized Error Management**
```typescript
// Simple notifications
this.errorHandler.showSuccess('Operation completed!');
this.errorHandler.showError('An error occurred');

// Specialized errors
this.errorHandler.showImageProcessingError(error);
this.errorHandler.showDatabaseError(error);
this.errorHandler.showNetworkError(error);
```

## 📱 Responsive Design

- **Mobile-first** approach
- **Breakpoint system** for all devices
- **Touch-friendly** interfaces
- **Performance optimized** for mobile

## 🌐 Internationalization

- **Multi-language** support (EN, RU, UA)
- **Dynamic language** switching
- **Localized** error messages
- **RTL** support ready

## 🔒 Security

- **JWT Authentication**
- **Role-based Access Control**
- **Input Validation**
- **File Upload Security**
- **CORS Configuration**

## 🚀 Deployment

### **Frontend**
```bash
ng build --prod
```

### **Backend**
```bash
npm run build
npm run start:prod
```

## 📚 Documentation

- [Admin UI System](./README_ADMIN_UI_SYSTEM.md)
- [Image Processing](./README_IMAGE_PROCESSING.md)
- [API Documentation](./docs/api.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review existing issues

---

**🎉 Built with ❤️ using Angular, NestJS, and Three.js**
