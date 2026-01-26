# 💳 Payment Setup Guide

Step-by-step guide to configure payment gateways for your e-commerce platform.

---

## 📋 Table of Contents

1. [Stripe Setup](#stripe-setup)
2. [PayPal Setup](#paypal-setup)
3. [LiqPay Setup](#liqpay-setup)
4. [Testing Payments](#testing-payments)
5. [Production Deployment](#production-deployment)
6. [Troubleshooting](#troubleshooting)

---

## 💳 Stripe Setup

Stripe is the primary payment gateway supporting cards, Apple Pay, and Google Pay.

### Step 1: Create Stripe Account

1. Go to [stripe.com/register](https://stripe.com/register)
2. Fill in your business information
3. Verify your email address
4. Complete identity verification

### Step 2: Get API Keys

#### For Testing (Development):

1. Login to Stripe Dashboard
2. Click **Developers** in left sidebar
3. Click **API Keys**
4. You'll see:
   - **Publishable key**: `pk_test_...`
   - **Secret key**: `sk_test_...` (click "Reveal")

#### For Production:

1. Toggle "Test Mode" OFF in Stripe Dashboard
2. Get live keys:
   - **Publishable key**: `pk_live_...`
   - **Secret key**: `sk_live_...`

### Step 3: Configure Backend

Edit `backend/.env`:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_51Abc123...your_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_51Abc123...your_publishable_key_here
```

### Step 4: Configure Frontend

Edit `src/environments/environment.ts` (development):

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3002/api',
  stripePublishableKey: 'pk_test_51Abc123...your_publishable_key_here'
};
```

Edit `src/environments/environment.prod.ts` (production):

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-api.com/api',
  stripePublishableKey: 'pk_live_...your_live_publishable_key'
};
```

### Step 5: Set Up Webhooks (Important!)

Webhooks notify your server about payment events.

1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **"+ Add endpoint"**
3. Enter endpoint URL:
   - Development: `http://localhost:3002/api/webhooks/stripe`
   - Production: `https://your-domain.com/api/webhooks/stripe`
4. Select events to listen for:
   - ✅ `payment_intent.succeeded`
   - ✅ `payment_intent.payment_failed`
   - ✅ `charge.refunded`
5. Click **"Add endpoint"**
6. Copy the **Signing secret** (starts with `whsec_`)
7. Add to `backend/.env`:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_...your_webhook_secret
   ```

### Step 6: Enable Payment Methods

1. In Stripe Dashboard, go to **Settings** → **Payment methods**
2. Enable desired methods:
   - ✅ Cards (Visa, Mastercard, etc.)
   - ✅ Apple Pay
   - ✅ Google Pay
   - ✅ Link (optional)
3. Click **"Save"**

### Step 7: Test Integration

1. Start your application
2. Add product to cart
3. Go to checkout
4. Use Stripe test card:
   - **Card number**: `4242 4242 4242 4242`
   - **Expiry**: Any future date (e.g., `12/34`)
   - **CVC**: Any 3 digits (e.g., `123`)
   - **ZIP**: Any 5 digits (e.g., `12345`)
5. Complete payment
6. Check Stripe Dashboard → Payments to see transaction

✅ **Success!** Stripe is configured.

---

## 🅿️ PayPal Setup

### Step 1: Create PayPal Business Account

1. Go to [paypal.com/business](https://www.paypal.com/business)
2. Click **"Sign Up"**
3. Choose **"Business Account"**
4. Complete registration

### Step 2: Create Developer Account

1. Go to [developer.paypal.com](https://developer.paypal.com/)
2. Login with your PayPal account
3. Click **"Dashboard"**

### Step 3: Create App Credentials

1. In Developer Dashboard, click **"My Apps & Credentials"**
2. Ensure you're in **"Sandbox"** mode for testing
3. Click **"Create App"**
4. Enter app name (e.g., "My E-commerce Store")
5. Choose **"Merchant"** account type
6. Click **"Create App"**
7. You'll get:
   - **Client ID**: `AbCd123...`
   - **Secret**: Click "Show" to reveal

### Step 4: Configure Backend

Edit `backend/.env`:

```env
# PayPal Configuration
PAYPAL_MODE=sandbox  # Use 'live' for production
PAYPAL_CLIENT_ID=AbCd123...your_client_id_here
PAYPAL_CLIENT_SECRET=EfGh456...your_client_secret_here
```

### Step 5: Configure Frontend

Edit `src/environments/environment.ts`:

```typescript
export const environment = {
  paypalClientId: 'AbCd123...your_client_id_here',
  paypalMode: 'sandbox'  // or 'live' for production
};
```

### Step 6: Enable PayPal in Admin

1. Login to Admin Panel
2. Go to **Settings** → **Payments**
3. Find **PayPal** section
4. Toggle **"Enable PayPal"** ON
5. Click **"Save"**

### Step 7: Test Integration

1. Go to checkout page
2. Select "PayPal" as payment method
3. Click **"Pay with PayPal"**
4. Login with sandbox test account:
   - Email: See Developer Dashboard → Sandbox → Accounts
   - Or create test account
5. Complete payment

### Step 8: Production Setup

When ready for live payments:

1. In PayPal Developer Dashboard, switch to **"Live"**
2. Create new app or activate existing one
3. Get **Live** Client ID and Secret
4. Update `backend/.env`:
   ```env
   PAYPAL_MODE=live
   PAYPAL_CLIENT_ID=your_live_client_id
   PAYPAL_CLIENT_SECRET=your_live_client_secret
   ```

✅ **Success!** PayPal is configured.

---

## 🇺🇦 LiqPay Setup

LiqPay is popular in Ukraine and Eastern Europe.

### Step 1: Register on LiqPay

1. Go to [liqpay.ua](https://www.liqpay.ua/)
2. Click **"Підключити"** (Connect)
3. Complete registration and verification
4. Provide business documents

### Step 2: Get API Keys

1. Login to LiqPay account
2. Go to **"API"** section
3. You'll see:
   - **Public Key**: `i123456789`
   - **Private Key**: Click to reveal

### Step 3: Configure Backend

Edit `backend/.env`:

```env
# LiqPay Configuration
LIQPAY_PUBLIC_KEY=i123456789
LIQPAY_PRIVATE_KEY=your_private_key_here
```

### Step 4: Set Up Server Callback

1. In LiqPay account, go to **Settings**
2. Find **"Server URL"** field
3. Enter your callback URL:
   ```
   https://your-domain.com/api/webhooks/liqpay
   ```
4. Save settings

### Step 5: Enable LiqPay in Admin

1. Go to Admin Panel → **Settings** → **Payments**
2. Find **LiqPay** section
3. Toggle **"Enable LiqPay"** ON
4. Save

### Step 6: Test Integration

LiqPay provides test card numbers:

- **Card**: `4242 4242 4242 4242`
- **CVV**: `111`
- **Expiry**: Any future date
- **3D Secure code**: `123456`

✅ **Success!** LiqPay is configured.

---

## 🧪 Testing Payments

### Stripe Test Cards

| Card Number | Scenario |
|-------------|----------|
| `4242 4242 4242 4242` | Successful payment |
| `4000 0000 0000 0002` | Card declined |
| `4000 0025 0000 3155` | Requires authentication (3D Secure) |
| `4000 0000 0000 9995` | Insufficient funds |

Full list: [stripe.com/docs/testing](https://stripe.com/docs/testing)

### PayPal Test Accounts

1. Go to Developer Dashboard → **Sandbox** → **Accounts**
2. Use provided test accounts:
   - **Personal account**: For buyer testing
   - **Business account**: For seller testing

### General Testing Checklist

- [ ] Can complete successful payment
- [ ] Order is created in database
- [ ] Order appears in Admin Panel
- [ ] Customer receives confirmation email
- [ ] Payment appears in gateway dashboard
- [ ] Can process refund
- [ ] Failed payment shows error message
- [ ] Webhook events are received

---

## 🚀 Production Deployment

### Pre-launch Checklist

- [ ] Switch all gateways to **LIVE** mode
- [ ] Update API keys to production keys
- [ ] Configure webhooks for production URLs
- [ ] Test with real payment (small amount)
- [ ] Verify SSL certificate is active (HTTPS)
- [ ] Review refund policies
- [ ] Set up payment notifications
- [ ] Enable fraud detection (if available)
- [ ] Configure currency settings
- [ ] Test on mobile devices

### Security Best Practices

1. **Never commit API keys** to version control
2. **Use environment variables** for all sensitive data
3. **Enable webhook signature verification**
4. **Use HTTPS** for all production traffic
5. **Keep dependencies updated** for security patches
6. **Monitor for suspicious transactions**
7. **Implement rate limiting** on payment endpoints
8. **Log all payment attempts** for audit trail

### Stripe Production Checklist

- [ ] Activate live mode in Stripe Dashboard
- [ ] Complete business verification
- [ ] Submit business documents
- [ ] Activate payout account
- [ ] Set up tax settings
- [ ] Configure statement descriptor
- [ ] Enable Radar (fraud detection)

### PayPal Production Checklist

- [ ] Verify business account
- [ ] Get **Live** app credentials
- [ ] Enable instant payment notification (IPN)
- [ ] Set up payout schedule
- [ ] Configure shipping settings

---

## 🛠️ Troubleshooting

### Issue: "Invalid API Key"

**Solution:**
1. Verify key is correct in `.env`
2. Ensure no extra spaces
3. Check you're using correct mode (test vs live)
4. Restart backend server

### Issue: "CORS Error" on Stripe

**Solution:**

Edit `backend/src/main.ts`:

```typescript
app.enableCors({
  origin: [
    'http://localhost:4200',
    'https://yourdomain.com'
  ],
  credentials: true
});
```

### Issue: Webhook Not Receiving Events

**Solution:**
1. Verify webhook URL is accessible
2. Check webhook signing secret is correct
3. Test webhook with Stripe CLI:
   ```bash
   stripe listen --forward-to localhost:3002/api/webhooks/stripe
   ```
4. Check server logs for errors

### Issue: Payment Succeeds but Order Not Created

**Solution:**
1. Check webhook is configured
2. Verify webhook secret in `.env`
3. Check backend logs for errors
4. Ensure database connection is stable

### Issue: 3D Secure Authentication Failing

**Solution:**
1. Ensure proper return URL is set
2. Check domain is whitelisted in Stripe
3. Test with cards that require authentication

### Issue: PayPal Sandbox Not Working

**Solution:**
1. Ensure using sandbox API keys
2. Check `PAYPAL_MODE=sandbox` in `.env`
3. Verify sandbox accounts are activated
4. Check Developer Dashboard for errors

---

## 📊 Payment Analytics

### View Transactions

#### Stripe Dashboard:
1. Login to Stripe
2. Click **"Payments"**
3. View all transactions, filter by status, export data

#### PayPal Dashboard:
1. Login to PayPal
2. Click **"Activity"**
3. View transactions and reports

#### Your Admin Panel:
1. Go to **Reports** → **Payments**
2. View all payment transactions
3. Filter by date, method, status
4. Export to CSV

---

## 💰 Refunds

### Process Refund via Stripe

1. Stripe Dashboard → **Payments**
2. Find payment
3. Click **"Refund"**
4. Enter amount (full or partial)
5. Add reason
6. Click **"Refund"**

### Process Refund via Admin Panel

1. Go to **Orders** → Find order
2. Click **"Issue Refund"**
3. Select amount
4. Add reason
5. Click **"Process Refund"**

Refund is automatically sent to payment gateway.

---

## 📚 Additional Resources

- [Stripe Documentation](https://stripe.com/docs)
- [PayPal Developer Docs](https://developer.paypal.com/docs/)
- [LiqPay API Documentation](https://www.liqpay.ua/documentation/en/)

---

## 🆘 Support

Need help with payments?

- 📧 Email: support@angular-ecommerce3d.com
- 📖 [FAQ](FAQ.md)
- 💬 Payment gateway support:
  - Stripe: [support.stripe.com](https://support.stripe.com/)
  - PayPal: [paypal.com/support](https://www.paypal.com/support)

---

**Payment Setup Guide Version**: 1.0  
**Last Updated**: January 2026
