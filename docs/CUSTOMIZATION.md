# 🎨 Customization Guide

Learn how to customize your Angular E-commerce 3D platform to match your brand.

---

## 📋 Table of Contents

1. [Changing Logo & Branding](#changing-logo--branding)
2. [Customizing Colors & Themes](#customizing-colors--themes)
3. [Modifying Text Content](#modifying-text-content)
4. [Adding New Pages](#adding-new-pages)
5. [Customizing Product Display](#customizing-product-display)
6. [Modifying 3D Viewer Settings](#modifying-3d-viewer-settings)
7. [Email Template Customization](#email-template-customization)
8. [Adding Custom CSS](#adding-custom-css)
9. [Internationalization](#internationalization)

---

## 🎯 Changing Logo & Branding

### Replace Logo (Admin Panel Method)

**Easiest method - No coding required!**

1. Login to Admin Panel
2. Navigate to **Settings** → **Appearance**
3. Click **"Upload Logo"**
4. Choose your logo file:
   - **Recommended size**: 200x60px to 300x80px
   - **Format**: PNG with transparent background (or SVG)
   - **Max size**: 2MB
5. Preview and click **"Save"**

### Replace Logo (File Method)

1. Prepare your logo:
   - Main logo: `logo.png` (for light backgrounds)
   - Dark logo: `logo-white.png` (for dark backgrounds)
   
2. Replace files in:
   ```
   src/assets/images/logo.png
   src/assets/images/logo-white.png
   ```

3. Rebuild application:
   ```bash
   npm start
   ```

### Replace Favicon

1. Create favicon (16x16px, 32x32px, 48x48px)
2. Use online generator: [favicon.io](https://favicon.io/)
3. Replace `src/favicon.ico`

### Update Site Title

Edit `src/index.html`:

```html
<head>
  <title>Your Store Name - Best E-commerce Platform</title>
  <meta name="description" content="Your store description here">
</head>
```

---

## 🌈 Customizing Colors & Themes

### Method 1: Using Admin Panel (Recommended)

1. Go to **Settings** → **Appearance** → **Customize**
2. Edit colors:
   - Primary Color
   - Secondary Color
   - Accent Color
   - Background Color
3. Preview changes in real-time
4. Click **"Save Changes"**

### Method 2: Editing Theme Files

Each theme has its own SCSS file:

```
src/styles/themes/
├── light-theme.scss
├── dark-theme.scss
├── glass-theme.scss
└── dark-glass-theme.scss
```

#### Example: Customize Light Theme

Edit `src/styles/themes/light-theme.scss`:

```scss
// Brand Colors
$primary-color: #0066CC;      // Your brand blue
$secondary-color: #FF6B35;    // Your accent orange
$success-color: #28a745;
$warning-color: #ffc107;
$danger-color: #dc3545;

// Background Colors
$background-primary: #FFFFFF;
$background-secondary: #F8F9FA;

// Text Colors
$text-primary: #212529;
$text-secondary: #6C757D;

// Button Styles
$button-border-radius: 8px;   // Rounded corners
$button-padding: 12px 24px;
```

After editing, rebuild:
```bash
npm start
```

### Create Custom Theme

1. Copy existing theme:
   ```bash
   cp src/styles/themes/light-theme.scss src/styles/themes/my-theme.scss
   ```

2. Edit colors in `my-theme.scss`

3. Import in `src/styles.scss`:
   ```scss
   @import 'themes/my-theme.scss';
   ```

4. Rebuild application

---

## ✍️ Modifying Text Content

### Homepage Text

Edit `src/app/pages/home/home.component.html`:

```html
<section class="hero">
  <h1>Welcome to Your Store</h1>  <!-- Change this -->
  <p>Your custom tagline here</p>  <!-- Change this -->
  <button>Shop Now</button>
</section>
```

### Footer Text

Edit `src/app/layout/footer/footer.component.html`:

```html
<footer>
  <div class="footer-about">
    <h3>About Your Store</h3>
    <p>Your custom about text here...</p>  <!-- Change this -->
  </div>
  <div class="footer-contact">
    <p>Email: your-email@example.com</p>  <!-- Change this -->
    <p>Phone: +1 234 567 8900</p>         <!-- Change this -->
  </div>
</footer>
```

### Using Translation Files (Recommended)

For multi-language support and easier management:

1. Edit English translations:
   ```
   src/assets/i18n/en.json
   ```

2. Example content:
   ```json
   {
     "home": {
       "title": "Welcome to Your Store",
       "subtitle": "Find the best products",
       "shopNow": "Shop Now"
     },
     "footer": {
       "about": "Your about text",
       "contact": "Contact Us",
       "email": "your-email@example.com"
     }
   }
   ```

3. Use in templates:
   ```html
   <h1>{{ 'home.title' | translate }}</h1>
   ```

---

## 📄 Adding New Pages

### Step 1: Generate Page Component

```bash
ng generate component pages/my-new-page
```

This creates:
```
src/app/pages/my-new-page/
├── my-new-page.component.ts
├── my-new-page.component.html
├── my-new-page.component.scss
└── my-new-page.component.spec.ts
```

### Step 2: Add Route

Edit `src/app/app-routing.module.ts`:

```typescript
const routes: Routes = [
  // ... existing routes
  {
    path: 'my-new-page',
    component: MyNewPageComponent
  }
];
```

### Step 3: Add Navigation Link

Edit header component `src/app/layout/header/header.component.html`:

```html
<nav>
  <a routerLink="/">Home</a>
  <a routerLink="/shop">Shop</a>
  <a routerLink="/my-new-page">My New Page</a>  <!-- Add this -->
</nav>
```

### Step 4: Create Page Content

Edit `src/app/pages/my-new-page/my-new-page.component.html`:

```html
<div class="page-container">
  <h1>My New Page</h1>
  <p>Your content here...</p>
</div>
```

### Step 5: Add Styles (Optional)

Edit `src/app/pages/my-new-page/my-new-page.component.scss`:

```scss
.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  
  h1 {
    font-size: 2.5rem;
    margin-bottom: 20px;
  }
}
```

---

## 🛍️ Customizing Product Display

### Products Per Page

Edit `src/app/pages/shop/shop.component.ts`:

```typescript
export class ShopComponent {
  itemsPerPage = 12;  // Change this number
}
```

### Product Card Layout

Edit `src/app/shared/ui/cards/product-card/product-card.component.scss`:

```scss
.product-card {
  border-radius: 12px;        // Card corner radius
  padding: 20px;             // Inner spacing
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);  // Shadow
  
  &:hover {
    transform: translateY(-8px);  // Hover lift effect
    box-shadow: 0 12px 24px rgba(0,0,0,0.15);
  }
}

.product-image {
  aspect-ratio: 1 / 1;       // Square images
  // or
  aspect-ratio: 4 / 3;       // Landscape images
}
```

### Grid Layout

Edit `src/app/pages/shop/shop.component.scss`:

```scss
.product-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);  // 4 columns desktop
  gap: 24px;
  
  @media (max-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);  // 3 columns tablet
  }
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);  // 2 columns mobile
  }
}
```

---

## 🎮 Modifying 3D Viewer Settings

### Global 3D Settings

Edit `src/app/components/three-viewer/three-viewer.component.ts`:

```typescript
export class ThreeViewerComponent {
  // Camera settings
  private cameraPosition = { x: 0, y: 2, z: 5 };  // Adjust position
  private fov = 45;  // Field of view (35-75)
  
  // Controls
  enableRotation = true;        // Allow rotation
  enableZoom = true;           // Allow zoom
  autoRotate = true;           // Auto-rotate on load
  autoRotateSpeed = 2.0;       // Rotation speed
  
  // Performance
  maxTextureSize = 2048;       // Max texture resolution
  shadowsEnabled = true;       // Enable shadows
  antialiasing = true;         // Smooth edges
  
  // Lighting
  ambientLightIntensity = 0.5;  // Ambient light
  directionalLightIntensity = 1.0;  // Main light
}
```

### Per-Product 3D Settings

These can be configured in Admin Panel when uploading 3D models.

### 3D Viewer Background

```typescript
// Solid color background
this.scene.background = new THREE.Color(0xf0f0f0);

// Or gradient (requires shader)
// Or environment map (for reflections)
```

### Add Custom Lighting

```typescript
// Add spotlight
const spotLight = new THREE.SpotLight(0xffffff, 1);
spotLight.position.set(10, 10, 10);
this.scene.add(spotLight);

// Add point light
const pointLight = new THREE.PointLight(0xff6b35, 0.5);
pointLight.position.set(-5, 5, 0);
this.scene.add(pointLight);
```

---

## 📧 Email Template Customization

### Edit Email Templates

Templates are in: `backend/src/templates/emails/`

#### Order Confirmation Email

Edit `backend/src/templates/emails/order-confirmation.html`:

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    /* Your custom styles */
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      font-family: Arial, sans-serif;
    }
    .header {
      background-color: #0066CC;  /* Your brand color */
      padding: 20px;
      text-align: center;
    }
    .logo {
      max-width: 200px;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <img src="your-logo-url" class="logo">
    </div>
    <div class="content">
      <h1>Thank you for your order!</h1>
      <p>Order #{{orderNumber}}</p>
      <!-- Your custom content -->
    </div>
  </div>
</body>
</html>
```

#### Email Signature

Add your custom signature at the bottom of all emails:

```html
<div class="signature">
  <p>Best regards,<br>
  Your Team Name<br>
  <a href="mailto:support@yourstore.com">support@yourstore.com</a><br>
  <a href="https://yourstore.com">yourstore.com</a></p>
</div>
```

---

## 🎨 Adding Custom CSS

### Global Custom Styles

Create `src/styles/custom.scss`:

```scss
// Your custom global styles
.btn-custom {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 12px 30px;
  border-radius: 25px;
  border: none;
  cursor: pointer;
  
  &:hover {
    transform: scale(1.05);
  }
}

// Custom container widths
.container-custom {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}
```

Import in `src/styles.scss`:

```scss
@import 'styles/custom.scss';
```

### Component-Specific Styles

Add styles to individual component SCSS files for scoped styling.

---

## 🌍 Internationalization

Your platform supports multiple languages using `ngx-translate`.

### Add New Language

#### Step 1: Create Translation File

Create `src/assets/i18n/de.json` (for German):

```json
{
  "home": {
    "title": "Willkommen in Ihrem Shop",
    "subtitle": "Finden Sie die besten Produkte"
  },
  "shop": {
    "products": "Produkte",
    "filter": "Filter",
    "sort": "Sortieren"
  },
  "cart": {
    "title": "Warenkorb",
    "empty": "Ihr Warenkorb ist leer",
    "checkout": "Zur Kasse"
  }
}
```

#### Step 2: Add Language to App

Edit `src/app/app.module.ts`:

```typescript
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  imports: [
    TranslateModule.forRoot({
      defaultLanguage: 'en',
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ]
})
```

#### Step 3: Add Language Switcher

Edit header component:

```html
<select (change)="changeLanguage($event)">
  <option value="en">English</option>
  <option value="de">Deutsch</option>
  <option value="fr">Français</option>
  <option value="es">Español</option>
</select>
```

```typescript
changeLanguage(event: any) {
  this.translate.use(event.target.value);
}
```

### Translate Database Content

For product names, descriptions (from database):

1. Add language columns to database
2. Or use separate translation tables
3. Or use external service like Locize

---

## 🔧 Advanced Customizations

### Change Typography

Edit `src/styles/typography.scss`:

```scss
// Import Google Fonts
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

// Set global font
body {
  font-family: 'Poppins', sans-serif;
}

// Headings
h1, h2, h3, h4, h5, h6 {
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
}
```

### Add Custom Animations

```scss
@keyframes slideInUp {
  from {
    transform: translateY(50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-slide-in {
  animation: slideInUp 0.6s ease-out;
}
```

### Modify Checkout Flow

To add custom fields to checkout:

1. Edit `src/app/pages/checkout/checkout.component.html`
2. Add form fields
3. Update `checkout.component.ts` to handle new fields
4. Update backend order model if needed

---

## 📚 Next Steps

- 💳 [Set Up Payment Gateways](PAYMENT_SETUP.md)
- ❓ [Read FAQ](FAQ.md)
- 👨‍💼 [Admin Manual](ADMIN_MANUAL.md)

---

## 🆘 Need Help?

- 📧 Email: support@angular-ecommerce3d.com
- 📖 [FAQ](FAQ.md)
- 💬 Community Forum (if available)

---

## ⚡ Quick Tips

- **Test changes locally** before deploying to production
- **Backup files** before making major changes
- **Use version control** (Git) to track changes
- **Check responsive design** on mobile after customizations
- **Clear browser cache** if changes don't appear

---

**Customization Guide Version**: 1.0  
**Last Updated**: January 2026
