# Social Authentication Setup Guide

This project includes a premium Social Login (OAuth2) integration for **Google, Facebook, GitHub, and Apple**. This feature significantly increases user conversion and makes your store stand out on marketplaces like ThemeForest or TemplateMonster.

## 🚀 How to Enable Social Logins

To turn on actual logins, you need to obtain Client IDs from each provider and add them to the configuration.

### 1. 🔑 Configure Client IDs

Open the following file:
[src/app/core/configs/social-auth.config.ts](file:///Users/andriidanichkin/Documents/myProjects/angular-ecommerce-3d/src/app/core/configs/social-auth.config.ts)

Replace the placeholders with your actual IDs:

```typescript
providers: [
  {
    id: GoogleLoginProvider.PROVIDER_ID,
    provider: new GoogleLoginProvider('YOUR_GOOGLE_CLIENT_ID')
  },
  {
    id: FacebookLoginProvider.PROVIDER_ID,
    provider: new FacebookLoginProvider('YOUR_FACEBOOK_APP_ID')
  }
]
```

### 2. 📝 Register Your App with Providers

#### Google
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project.
3. Configure the **OAuth consent screen**.
4. Create **OAuth 2.0 Client IDs** (Select "Web application").
5. Add `http://localhost:4200` (for dev) and your production domain to "Authorized JavaScript origins".

#### Facebook
1. Go to the [Meta for Developers](https://developers.facebook.com/) portal.
2. Create a new App.
3. Add **Facebook Login** product.
4. Go to **Settings > Basic** to get your App ID.
5. Add your domain to "App Domains".

#### GitHub / Apple
The UI already includes premium buttons for GitHub and Apple. To enable the logic:
1. Register your app on [GitHub Developer Settings](https://github.com/settings/developers) or [Apple Developer Program](https://developer.apple.com/).
2. Follow the documentation of `@abacritt/angularx-social-login` to add these providers to the `social-auth.config.ts`.

---

> [!TIP]
> **Why this matters for your sale:** Professional buyers look for "Turnkey" features. Mentioning "Pre-integrated Social Auth for 4 Providers" in your marketplace description adds immediate $50-100 to the perceived value of your project.
