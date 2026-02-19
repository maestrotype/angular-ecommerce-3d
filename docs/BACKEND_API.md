# Backend API Reference

The backend is built with NestJS and provides a robust REST API for both the frontend and the admin panel.

## 📖 Interactive Documentation (Swagger)

The project includes built-in Swagger documentation. 
1. Start the backend: `npm run start:dev` (locally) or deploy to a server.
2. Navigate to: `http://localhost:3002/api/docs`

You will see a list of all endpoints, their expected payloads (DTOs), and response formats.

## 🔑 Authentication

Most endpoints require a JWT token in the `Authorization` header:
`Authorization: Bearer <your-token>`

Login via: `POST /api/auth/login`

## 📦 Core Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/products` | GET | List all products (with pagination & filters) |
| `/api/products/:id` | GET | Get product details including 3D model path |
| `/api/orders` | POST | Create a new order (requires Auth) |
| `/api/sections` | GET | Fetch dynamic content for home/header |
| `/api/seo` | GET | Site-wide SEO settings |

## 🚀 Advanced Features

### AI Background Removal
Endpoint: `POST /api/upload-module/remove-bg`
Uses the configured Remove.bg API key to process images dynamically.

### Health Check
Endpoint: `GET /api/health`
Used by the frontend's **Dynamic API Fallback** to check backend availability.
