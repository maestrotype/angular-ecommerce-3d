# Customization and Extensibility

Developer-facing instructions for extending the platform's functionality and visual style.

**For theme architecture deep-dive**, see `THEME_ENGINE.md` and `STYLE_ARCHITECTURE.md`.

---

## Theme Architecture (Quick Reference)

The platform uses a CSS variable-based token system located in `src/styles/themes/`.

### Modifying Theme Tokens

1. Locate the specific theme SCSS file (e.g., `src/styles/themes/_default.scss`).
2. Update the functional token variables (`--accent-primary`, `--hero-gradient`, etc.).
3. The `ThemeService` handles runtime application of tokens via the `[data-theme]` attribute on `<body>`.

**Full documentation**: See `THEME_ENGINE.md` for the complete theme engine specification and `STYLE_ARCHITECTURE.md` for token flow and override rules.

---

## 3D Viewer Configuration

The `ThreeDViewerComponent` is the core engine for product visualization.

### Component Inputs

- `modelPath`: URI to the `.glb` or `.gltf` asset.
- `scale`: `[x, y, z]` array (Default: `[1, 1, 1]`).
- `position`: `[x, y, z]` world space coordinates.

### Performance Adjustments

To optimize for lower-end devices, the component automatically scales the pixel ratio:

```typescript
const pixelRatio = Math.min(window.devicePixelRatio, 1.5);
this.renderer.setPixelRatio(pixelRatio);
```

Shadow maps are dynamically disabled on mobile devices detected via `userAgent` to maintain 60 FPS.

---

## Localized Content (i18n)

Translation assets are managed via `@ngx-translate`.

- **Location**: `src/assets/i18n/*.json`
- **Addition**: Create a new locale file (e.g., `fr.json`) and register the locale code in the `AppModule` translate configuration.

---

## API Integration & DTOs

If adding new product attributes:

1. **Backend**: Update the `Product` entity and the corresponding `CreateProductDto` in `backend/src/products/`.
2. **Frontend**: Update the `Product` interface in `src/shared/models/product.model.ts`.
3. The Angular `ProductService` will automatically map the new fields during the next HTTP request.

---

## Social Login Configuration (Google & Facebook)

This project uses `@abacritt/angularx-social-login` to handle social authentication. For the social login buttons to work on the frontend, you must provide your own valid API credentials. Out of the box, the code contains placeholder strings to protect your API limits and security.

### Step 1: Obtain API Keys

- **Google Client ID**: Go to the [Google Cloud Console](https://console.cloud.google.com/), create a new project, configure the OAuth consent screen, and create an OAuth 2.0 "Client ID" specifically for a "Web Application". Ensure your domain is added to the authorized origins.
- **Facebook App ID**: Go to the [Facebook Developers Portal](https://developers.facebook.com/), create a new app, set up "Facebook Login" for web, and copy the "App ID".

### Step 2: Configure the Frontend

1. Open the configuration file located at `src/app/core/configs/social-auth.config.ts`.
2. Locate the `GoogleLoginProvider` and `FacebookLoginProvider` initialization scopes.
3. Replace the placeholder strings (`'YOUR_GOOGLE_CLIENT_ID'` and `'YOUR_FACEBOOK_APP_ID'`) with your actual keys:

```typescript
export const socialAuthConfig: SocialAuthServiceConfig = {
    autoLogin: false,
    providers: [
        {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider('YOUR_ACTUAL_GOOGLE_CLIENT_ID_HERE')
        },
        {
            id: FacebookLoginProvider.PROVIDER_ID,
            provider: new FacebookLoginProvider('YOUR_ACTUAL_FACEBOOK_APP_ID_HERE')
        }
    ],
    onError: (err) => {
        console.error('Social Auth Error:', err);
    }
};
```

4. Rebuild and restart the application (`npm run build` / `npm run serve:ssr:angular-ecommerce-3d`). The social login buttons in the auth modal will now successfully launch the Google and Facebook provider popups and capture user data.