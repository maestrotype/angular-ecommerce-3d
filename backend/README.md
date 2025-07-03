
# Angular E-commerce Backend

A clean and scalable NestJS backend with PostgreSQL to support the Angular e-commerce admin functionality.

## Features

- **NestJS Framework**: Modern, scalable Node.js server-side application framework
- **PostgreSQL Database**: Robust relational database with TypeORM
- **JWT Authentication**: Secure authentication with role-based access control
- **Product Management**: Full CRUD operations for products
- **Admin Panel Support**: API endpoints specifically designed for admin functionality
- **Environment Configuration**: Flexible configuration for different environments
- **Data Validation**: Input validation using class-validator
- **CORS Enabled**: Cross-origin resource sharing for frontend integration

## Installation

1. **Clone the repository and navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   Edit the `.env` file with your database credentials and JWT secret.

4. **Set up PostgreSQL database:**
   - Create a PostgreSQL database named `ecommerce_db` (or as specified in your .env)
   - The application will automatically create tables on first run

5. **Create an admin user:**
   ```bash
   # After starting the server, make a POST request to:
   curl -X POST http://localhost:3000/api/auth/create-admin
   ```

## Running the Application

### Development
```bash
npm run start:dev
```

### Production
```bash
npm run build
npm run start:prod
```

The server will start on `http://localhost:3002` with API routes prefixed with `/api`.

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/register` - Register new user
- `GET /api/auth/profile` - Get current user profile
- `POST /api/auth/create-admin` - Create admin user (development only)

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/featured` - Get featured products
- `GET /api/products?category=electronics` - Filter by category
- `POST /api/products` - Create product (admin only)
- `PATCH /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

## Database Schema

### Products Table
- `id` - Primary key (auto-generated)
- `name` - Product name (required)
- `category` - Product category (required)
- `price` - Product price (required)
- `stock` - Stock quantity (required)
- `description` - Product description (required)
- `imageUrl` - Product image URL (optional)
- `specifications` - JSON object for product specs (optional)
- `discount` - Discount percentage (optional)
- `isSpecial` - Featured product flag (optional)
- `rating` - Product rating (optional)
- `features` - Array of product features (optional)
- `images` - Array of additional images (optional)
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

### Users Table
- `id` - Primary key (auto-generated)
- `email` - User email (unique, required)
- `name` - User name (required)
- `password` - Hashed password (required)
- `role` - User role (admin/user, default: user)
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

## Default Admin Credentials
- Email: `admin@example.com`
- Password: `admin123`

## Deployment

### Environment Variables for Production
```bash
DATABASE_HOST=your-postgres-host
DATABASE_PORT=5432
DATABASE_USERNAME=your-username
DATABASE_PASSWORD=your-password
DATABASE_NAME=your-database-name
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
PORT=3000
NODE_ENV=production
```

### Deploy to Render.com
1. Connect your GitHub repository to Render
2. Set up environment variables in Render dashboard
3. Use the following build and start commands:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start:prod`

## Next Steps

With this backend in place, you can now:

1. **Update your Angular frontend** to use real API calls instead of mock data
2. **Implement Categories module** for category management
3. **Add Orders module** for order processing
4. **Expand User management** with more user operations
5. **Add file upload** for product images
6. **Implement search functionality** with full-text search
7. **Add pagination** for large datasets

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
