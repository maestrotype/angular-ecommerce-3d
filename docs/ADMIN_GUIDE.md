# Admin Dashboard Manual

Guide for store owners and administrators to manage products, orders, and site-wide settings.

## Authentication
Access the dashboard via `/admin`. 
- **Default Credentials**: `admin@example.com` / `admin123`.
- Authenticated sessions are managed via JWT.

## Catalog Management

### Managing Products
The product management view allows for CRUD operations on your inventory.
- **3D Models**: When adding a product, upload the GLB/GLTF model. The system automatically processes the file and updates the interactive viewer on the product page.
- **AI Background Removal**: The product image uploader includes an "AI Remove BG" feature (requires Remove.bg API key configuration).

### Categories
Organize your catalog by creating and nesting categories. Category changes are reflected immediately in the frontend search filters.

## Store Configuration

### SEO & Metadata
Configure global site settings via **Settings > SEO**.
- **Meta Tags**: Set default titles, descriptions, and keywords.
- **Automatic Sitemap**: The system automatically updates the `sitemap.xml` based on active products and categories.

### Appearance (Themes)
Switch between Light, Dark, Ice, and Ember in the admin appearance / theme switcher (storefront uses Light, Dark, Aurora). These changes apply instantly via `ThemeService`. CSS ids remain `light`, `dark`, `glass`, `dark-glass`.

## Order Processing
The dashboard provides a real-time view of incoming orders.
- **Status Tracking**: Update order status (Pending, Shipped, Delivered) to trigger customer notifications.
- **Transaction Logs**: View payment details for Stripe and PayPal transactions.

## Notifications
The sidebar displays a badge for new orders and user registrations. Detailed logs are available in the **Notifications** section.
