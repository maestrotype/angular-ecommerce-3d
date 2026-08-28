# 🚀 Deployment Guide - Angular E-commerce 3D

## ✅ Pre-Deployment Checklist (COMPLETED)

All necessary fixes have been applied:

- ✅ **Frontend Environment** - Fixed `environment.prod.ts` to use production API
- ✅ **Backend CORS** - Already configured for GitHub Pages
- ✅ **GitHub Pages SPA Support** - Added `.nojekyll` and `404.html`
- ✅ **Angular Router Support** - Added redirect scripts to `index.html`
- ✅ **Build Configuration** - Updated `angular.json` to include necessary files

---

## 📦 Deployment Steps

### 1. Build the Project

```bash
npm run build:gh
```

This command:
- Builds with production configuration
- Sets `base-href` to `/angular-ecommerce-3d/`
- Optimizes assets
- Replaces `environment.ts` with `environment.prod.ts`

### 2. Deploy to GitHub Pages

```bash
npm run deploy
```

Or manually:

```bash
npm run build:gh
node scripts/deploy-gh-pages.cjs
```

### 3. Verify Deployment

After deployment, visit:
- **Frontend**: https://maestrotype.github.io/angular-ecommerce-3d/
- **Backend API**: https://angular-ecommerce-backend.onrender.com/api

---

## 🔧 Configuration Details

### Frontend (Angular)

**Development** (`environment.ts`):
```typescript
apiUrl: 'http://localhost:3002/api'
```

**Production** (`environment.prod.ts`):
```typescript
apiUrl: 'https://angular-ecommerce-backend.onrender.com/api'
```

### Backend (NestJS)

**CORS Configuration** (`backend/src/main.ts`):
```typescript
app.enableCors({
  origin: [
    "http://localhost:4200",
    "https://maestrotype.github.io",
    /^https:\/\/.*\.github\.io$/
  ],
  credentials: true
});
```

---

## 🐛 Troubleshooting

### Issue: "Unspecified error (run without silent option for detail)" on `npm run deploy`
**Cause**: `angular-cli-ghpages` hides the real git error. The push itself often fails with `RPC failed; HTTP 400` because the demo 3D models make a large HTTPS pack (GitHub's default HTTP buffer / HTTP/2).
**Solution**: Use `npm run deploy` (it now calls `scripts/deploy-gh-pages.cjs`, which prints git errors and raises the HTTP buffer). If a previous run already built `dist/`, retry publish only:

```bash
node scripts/deploy-gh-pages.cjs
```

### Issue: "Failed to load resource: net::ERR_FAILED"
**Cause**: API URL not configured correctly
**Solution**: Verify `environment.prod.ts` uses the correct backend URL

### Issue: "CORS policy error"
**Cause**: Backend not allowing frontend domain
**Solution**: Check backend `main.ts` CORS configuration includes your domain

### Issue: "404 on page refresh"
**Cause**: GitHub Pages doesn't support SPA routing by default
**Solution**: Already fixed with `404.html` and redirect scripts

### Issue: "Assets not loading"
**Cause**: Incorrect `base-href`
**Solution**: Use `--base-href=/angular-ecommerce-3d/` in build command

---

## 📊 Environment Variables

### Backend `.env` (Render.com)

Make sure your backend has these environment variables set:

```env
# Database
DATABASE_HOST=your-postgres-host
DATABASE_PORT=5432
DATABASE_USER=your-db-user
DATABASE_PASSWORD=your-db-password
DATABASE_NAME=your-db-name

# JWT
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Stripe (optional)
STRIPE_SECRET_KEY=your-stripe-secret-key

# PayPal (optional)
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret
```

---

## 🎯 Quick Commands

| Command | Description |
|---------|-------------|
| `npm start` | Run dev server (localhost:4200) |
| `npm run build` | Build for production |
| `npm run build:gh` | Build with GitHub Pages base-href |
| `npm run deploy` | Build and deploy to GitHub Pages |

---

## 🔐 Security Notes

1. **Never commit** `.env` files
2. **API Keys**: Use test keys for demo deployment
3. **CORS**: Keep whitelist restrictive in production
4. **JWT Secret**: Use strong random string (32+ characters)

---

## ✨ Post-Deployment

After successful deployment:

1. ✅ Test all routes (home, shop, admin, etc.)
2. ✅ Verify API calls work (check Network tab)
3. ✅ Test admin panel login
4. ✅ Check 3D model loading
5. ✅ Test cart and checkout flow
6. ✅ Verify responsive design on mobile

---

## 📝 Notes

- **GitHub Pages**: Free hosting, but only for static files (frontend)
- **Backend**: Must be hosted separately (Render, Heroku, Railway, etc.)
- **Build Time**: ~1-2 minutes
- **Deploy Time**: ~1-2 minutes
- **Total**: ~5 minutes from build to live

---

**Last Updated**: December 8, 2025
**Status**: ✅ Ready for deployment

