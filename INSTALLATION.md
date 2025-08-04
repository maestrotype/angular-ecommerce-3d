# 📦 Installation Guide

## Quick Setup

### 1. Install Dependencies
```bash
npm install
cd backend && npm install
```

### 2. Configure Environment
```bash
# Copy environment file
cp backend/.env.example backend/.env

# Edit backend/.env with your settings
```

### 3. Start Application
```bash
# Terminal 1 - Frontend
npm start

# Terminal 2 - Backend
cd backend && npm run start:dev
```

### 4. Access Application
- **Frontend**: http://localhost:4200
- **Admin Panel**: http://localhost:4200/admin
- **Default Admin**: admin@example.com / admin123

## Environment Configuration

### Required Variables
```bash
# Database (PostgreSQL)
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=ecommerce_db

# JWT
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=7d

# APIs
REMOVE_BG_API_KEY=your-remove-bg-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## Production Deployment

### Frontend Build
```bash
ng build --prod
```

### Backend Build
```bash
cd backend
npm run build
npm run start:prod
```

## Troubleshooting

### Common Issues
1. **Port 4200 in use**: Use `ng serve --port 4201`
2. **Database connection**: Check PostgreSQL is running
3. **API keys**: Verify Remove.bg and Cloudinary keys
4. **Node version**: Ensure Node.js 18+ is installed

### Support
- Check documentation in `/docs` folder
- Review existing issues
- Create new issue if needed 