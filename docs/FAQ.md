# ❓ Frequently Asked Questions (FAQ)

Find answers to common questions about Angular E-commerce 3D platform.

---

## 📋 Table of Contents

1. [General Questions](#general-questions)
2. [Installation & Setup](#installation--setup)
3. [Product Management](#product-management)
4. [3D Models](#3d-models)
5. [Payments & Orders](#payments--orders)
6. [Customization](#customization)
7. [Troubleshooting](#troubleshooting)
8. [Performance & Optimization](#performance--optimization)

---

## 🌐 General Questions

### Q: What technologies are used in this platform?

**A:** 
- **Frontend**: Angular 17+, Three.js, Angular Material
- **Backend**: NestJS 10+, TypeORM
- **Database**: PostgreSQL 14+
- **Payments**: Stripe, PayPal, LiqPay
- **3D Rendering**: Three.js with WebGL

### Q: Do I need coding knowledge to use this?

**A:** Basic knowledge is helpful but not required for:
- Adding/editing products via admin panel
- Managing orders
- Changing themes
- Basic customization

Advanced customization requires HTML/CSS/TypeScript knowledge.

### Q: Can I use this for commercial projects?

**A:** Yes! The Regular License allows use for one commercial website. For multiple sites or SaaS, purchase Extended License.

### Q: Is it mobile responsive?

**A:** Yes! The platform is fully responsive and works on all devices including desktops, tablets, and smartphones.

### Q: Does it support multiple languages?

**A:** Yes, using ngx-translate. English is included by default. You can add more languages by creating translation files.

### Q: What browsers are supported?

**A:** 
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ⚠️ IE11 is NOT supported (for 3D features)

---

## 🛠️ Installation & Setup

### Q: What are the minimum system requirements?

**A:**
- Node.js 18+
- PostgreSQL 14+
- 4GB RAM minimum (8GB recommended)
- 2GB free disk space

### Q: How long does installation take?

**A:** With the Quick Start Guide, you can be up and running in 5-10 minutes.

### Q: Do I need a VPS/dedicated server?

**A:** 
- **Development**: No, works on local machine
- **Production**: Recommended for best performance
- **Shared hosting**: Not recommended for backend

### Q: Can I use MySQL instead of PostgreSQL?

**A:** The code is written for PostgreSQL. While TypeORM supports MySQL, some features may need adjustments. PostgreSQL is strongly recommended.

### Q: How do I change the default port?

**A:**
- Frontend: `npm start -- --port 4300`
- Backend: Edit `PORT=3002` in `backend/.env`

### Q: Installation fails with "npm ERR!". What do I do?

**A:**
```bash
# Clear cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Q: Database connection error on first run?

**A:**
1. Ensure PostgreSQL is running
2. Check credentials in `backend/.env`
3. Verify database `ecommerce_db` exists
4. Test connection: `psql -U postgres -d ecommerce_db`

---

## 🛍️ Product Management

### Q: How many products can I add?

**A:** No hard limit. Tested with 10,000+ products. Performance depends on your server resources.

### Q: Can I import products from CSV/Excel?

**A:** Yes! Use the Import feature in Admin Panel → Products → Import.

### Q: What image formats are supported?

**A:** JPG, PNG, WebP, and SVG. Recommended size: 800x800px.

### Q: Can I remove image backgrounds automatically?

**A:** Yes, if you configure Remove.bg API key. See [Admin Manual](ADMIN_MANUAL.md#step-4-images).

### Q: How do I feature a product on homepage?

**A:** Edit product and check "Featured Product" option.

### Q: Can I schedule products to publish later?

**A:** Yes, use the "Publish Date" field when creating/editing products.

### Q: How do I create product variants (sizes, colors)?

**A:** Currently, variants are handled via specifications. Full variant support can be custom developed.

### Q: Can products have multiple categories?

**A:** Currently one category per product. Multi-category support can be custom developed.

---

## 🎮 3D Models

### Q: What 3D file formats are supported?

**A:** GLB (binary) and GLTF (text). GLB is recommended for better performance.

### Q: What's the maximum 3D model file size?

**A:** Technical limit is 50MB, but **10MB or less** is strongly recommended for optimal loading times.

### Q: Where can I get 3D models?

**A:**
- Create your own with Blender (free)
- Purchase from Sketchfab, TurboSquid, CGTrader
- Use free models from Poly Haven, Free3D

### Q: How do I optimize 3D models?

**A:**
1. Use GLB format (compressed)
2. Reduce polygon count
3. Compress textures (max 2048x2048px)
4. Use Draco compression
5. Tools: Blender, gltf-pipeline

### Q: 3D model appears too large/small?

**A:** Adjust the "Scale" setting when uploading model in admin panel.

### Q: Can customers interact with 3D models?

**A:** Yes! They can:
- Rotate (click & drag)
- Zoom (scroll wheel)
- Pan (right-click & drag)
- Works on touch devices too

### Q: Do 3D models work on mobile?

**A:** Yes, but performance varies by device. Optimize models for mobile:
- Keep under 5MB
- Reduce polygon count
- Use simple textures

### Q: What if my product doesn't have a 3D model?

**A:** No problem! Products work perfectly with just 2D images. 3D is optional.

---

## 💳 Payments & Orders

### Q: Which payment gateways are included?

**A:** 
- ✅ Stripe (cards, Apple Pay, Google Pay)
- ✅ PayPal
- ✅ LiqPay (Ukraine/Eastern Europe)

### Q: Can I add other payment methods?

**A:** Yes, but requires custom development. The architecture supports adding new gateways.

### Q: Do I need SSL certificate?

**A:** **YES!** Required for production. Payments won't work without HTTPS.

### Q: How do I test payments without real money?

**A:** Use test mode API keys and test card numbers. See [Payment Setup Guide](PAYMENT_SETUP.md#testing-payments).

### Q: Where do payments go?

**A:** Directly to your Stripe/PayPal/LiqPay account. Platform doesn't hold funds.

### Q: What's the transaction fee?

**A:** 
- **Platform**: No fees! 
- **Payment gateways**: Stripe ~2.9%, PayPal ~2.9%, LiqPay varies

### Q: Can I process refunds?

**A:** Yes, from Admin Panel → Orders → View Order → Issue Refund.

### Q: Do customers receive order confirmation emails?

**A:** Yes, automatically sent after successful payment (if SMTP is configured).

### Q: How do I track orders?

**A:** Admin Panel → Orders. You can update status, add tracking numbers, and view timeline.

### Q: Can I export orders to CSV?

**A:** Yes, Admin Panel → Orders → Export.

---

## 🎨 Customization

### Q: Can I change the logo?

**A:** Yes! Admin Panel → Settings → Appearance → Upload Logo. Or replace `src/assets/images/logo.png`.

### Q: How do I change colors/theme?

**A:** Admin Panel → Settings → Appearance → Customize. Or edit SCSS files.

### Q: Can I add custom pages?

**A:** Yes! See [Customization Guide](CUSTOMIZATION.md#adding-new-pages).

### Q: How do I change footer text?

**A:** Edit `src/app/layout/footer/footer.component.html` or use translation files.

### Q: Can I use my own domain?

**A:** Yes! Point your domain to server IP and update environment files.

### Q: How do I add more products to homepage?

**A:** Edit `itemsPerPage` in relevant component or mark more products as "Featured".

### Q: Can I hide out-of-stock products?

**A:** Yes, set product status to "Inactive" or implement filter in shop component.

### Q: How do I add Google Analytics?

**A:** Admin Panel → Settings → SEO → Google Analytics ID.

---

## 🔧 Troubleshooting

### Q: "Cannot connect to backend API"

**A:**
1. Check backend is running (`npm run start:dev` in backend folder)
2. Verify API URL in `environment.ts`
3. Check CORS settings in backend
4. Check firewall/network settings

### Q: Admin panel login not working?

**A:**
1. Verify credentials (default: `admin@example.com` / `admin123`)
2. Check backend logs for errors
3. Verify database connection
4. Try creating new admin: `curl -X POST http://localhost:3002/api/auth/create-admin`

### Q: 3D models not loading?

**A:**
1. Check file format (must be .glb or .gltf)
2. Verify file size (< 10MB recommended)
3. Check browser console for errors
4. Try different model file
5. Clear browser cache

### Q: Images not uploading?

**A:**
1. Check file size (< 5MB)
2. Verify Cloudinary credentials (if using)
3. Check backend logs
4. Ensure uploads folder has write permissions

### Q: Email notifications not sending?

**A:**
1. Verify SMTP settings in `backend/.env`
2. Test SMTP with online tool
3. Check spam folder
4. Review backend logs

### Q: Website slow loading?

**A:**
1. Optimize images (use WebP format)
2. Optimize 3D models (reduce file size)
3. Enable production build
4. Use CDN for static assets
5. Check database queries performance

### Q: Changes not appearing after edit?

**A:**
1. Clear browser cache (Ctrl+Shift+R)
2. Check you edited correct environment file
3. Rebuild application: `npm run build`
4. Restart servers

---

## ⚡ Performance & Optimization

### Q: How do I improve page load speed?

**A:**
1. Enable production build: `npm run build:prod`
2. Use WebP images
3. Enable gzip compression on server
4. Use CDN for static assets
5. Optimize 3D models
6. Enable lazy loading
7. Implement caching

### Q: How many concurrent users can it handle?

**A:** Depends on server resources. Typical VPS can handle:
- 100-500 concurrent users comfortably
- Scale horizontally for more traffic

### Q: Should I use Docker?

**A:** Recommended for:
- Consistent environments
- Easy deployment
- Scaling
- Development teams

Not required for small deployments.

### Q: How do I backup my data?

**A:**
```bash
# Database backup
pg_dump -U postgres ecommerce_db > backup.sql

# Restore
psql -U postgres ecommerce_db < backup.sql
```

### Q: Can I use Redis for caching?

**A:** Yes! Redis integration can be added for:
- Session storage
- API response caching
- Cart persistence

Requires custom configuration.

### Q: How often should I update?

**A:** 
- **Security patches**: Immediately
- **Feature updates**: As needed
- **Dependencies**: Monthly review recommended

---

## 🔐 Security & Privacy

### Q: Is it secure for production?

**A:** Yes, but follow best practices:
- Use HTTPS
- Strong passwords
- Keep dependencies updated
- Regular backups
- Enable database encryption
- Configure firewall

### Q: Is customer data encrypted?

**A:**
- Passwords: Yes (bcrypt hashing)
- Payment data: Handled by payment gateways (PCI compliant)
- Database: Can enable PostgreSQL encryption

### Q: GDPR compliant?

**A:** Framework is GDPR-ready. You need to:
- Add privacy policy
- Implement cookie consent
- Enable data export
- Implement right to deletion
- Add terms of service

### Q: Can I enable two-factor authentication?

**A:** Not included by default. Can be custom developed using:
- SMS (Twilio)
- TOTP (Google Authenticator)
- Email codes

---

## 📱 Mobile & Responsive

### Q: Does it work on tablets and phones?

**A:** Yes! Fully responsive design works on all screen sizes.

### Q: Can I create a mobile app?

**A:** Platform is web-based. Options:
- Progressive Web App (PWA) - can be added
- Ionic wrapper - create native apps
- React Native/Flutter - requires rewrite

### Q: Touch controls working for 3D?

**A:** Yes! 
- One finger: Rotate
- Two fingers pinch: Zoom
- Two fingers drag: Pan

---

## 🌍 Deployment & Hosting

### Q: Where should I host this?

**A:** Recommended:
- **Frontend**: Vercel, Netlify, GitHub Pages
- **Backend**: Render, Railway, Heroku, DigitalOcean
- **Database**: Managed PostgreSQL (AWS RDS, DigitalOcean)

### Q: What's the monthly hosting cost?

**A:** Entry level:
- **VPS**: $5-10/month (DigitalOcean, Linode)
- **Backend**: $7/month (Render.com)
- **Database**: $15/month (managed PostgreSQL)
- **Total**: ~$20-30/month

Can start with free tiers for testing.

### Q: Can I use shared hosting?

**A:** Frontend only (static files). Backend requires Node.js support which most shared hosts don't provide well.

### Q: How do I deploy updates?

**A:**
1. Build new version locally
2. Run tests
3. Deploy via Git push (if using Render/Heroku)
4. Or manually upload files
5. Run database migrations if needed

---

## 💼 Licensing & Support

### Q: Can I remove "Powered by" credits?

**A:** Yes, with commercial license you can remove all credits.

### Q: Can I resell this product?

**A:** No, reselling is prohibited. You can build websites for clients but cannot resell the source code.

### Q: Do I get free updates?

**A:** Yes! Free updates for lifetime (varies by marketplace). Compatible updates included.

### Q: What support is included?

**A:** 
- 6 months support included
- Email support
- Bug fixes
- Installation help
- Configuration guidance

Extended support available for purchase.

### Q: Can I hire you for customization?

**A:** Contact via support email for custom development quotes.

---

## 🆘 Still Have Questions?

- 📧 **Email**: support@angular-ecommerce3d.com
- 📖 **Documentation**: [Installation](INSTALLATION.md) | [Admin Manual](ADMIN_MANUAL.md) | [Customization](CUSTOMIZATION.md)
- 🐛 **Bug Reports**: Via support email with details

---

**FAQ Version**: 1.0  
**Last Updated**: January 2026  
**Questions Answered**: 88+
