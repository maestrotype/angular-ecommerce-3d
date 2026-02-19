# Backend API Architecture

Technical reference for the NestJS-based REST API.

## API Specification

The API follows RESTful principles and is fully documented via Swagger.
- **Local Access**: `http://localhost:3002/api/docs`
- **Prefix**: All endpoints are prefixed with `/api`.

## Authentication & Security

### Authorization Header
All protected routes require a JSON Web Token (JWT).
```http
Authorization: Bearer <JWT_TOKEN>
```

### Authentication Guards
- **JwtAuthGuard**: Validates the presence and integrity of the JWT.
- **RolesGuard**: Verifies permissions (e.g., `admin` role) using the `@Roles()` decorator.

## Core Modules & Endpoints

### Authentication (`/auth`)
- `POST /auth/register`: Public registration (returns token).
- `POST /auth/login`: Identity verification.
- `GET /auth/profile`: Retrieves current user context (requires JWT).

### Products (`/products`)
- `GET /products`: Paginated product list with search/category support.
- `POST /products`: Multi-part request for product metadata and 3D assets (Admin only).
- `DELETE /products/:id`: Cascading deletion of product assets.

### Orders (`/orders`)
- `GET /orders`: Fetch order history for the authenticated user.
- `POST /orders`: Checkout initialization.

### Sections & Content (`/sections`)
- `GET /sections`: Fetch dynamic homepage components and 3D scene settings.
- `PUT /sections/:id`: Update dynamic section content (Admin only).

## Data Validation (DTOs)

The backend utilizes `class-validator` for strict payload verification.
- **Transform**: Incoming payloads are automatically transformed to DTO instances via `ValidationPipe({ transform: true })`.
- **Validation**: Rejects requests with malformed or unwhitelisted properties to prevent overposting attacks.

## Integration Services

### Dynamic SEO Service
The `SeoService` dynamically serves meta-tags and site-wide configuration based on the current entity (Product/Category), optimized for high-performance indexing.

### Health & Monitoring
- `GET /health`: System heartbeat endpoint used by the frontend for dynamic service detection.
