# 💳 Payments Module - Backend

## Overview
This module handles all payment operations including LiqPay integration, payment processing, and webhook handling.

## 🚀 Features
- **LiqPay Integration** - Ukrainian payment system
- **Payment Processing** - Create, track, and manage payments
- **Webhook Handling** - Process payment notifications from LiqPay
- **Email Notifications** - Send payment status updates
- **Admin API** - Manage payments from admin panel

## 📦 Installation

### 1. Install Dependencies
```bash
cd backend
npm install liqpay-node-sdk crypto
```

### 2. For ThemeForest Customers
If you purchased this template, follow these steps:

#### Quick Setup (5 minutes):
```bash
# 1. Copy environment template
cp .env.example .env

# 2. Update these values in .env:
LIQPAY_PUBLIC_KEY=pk_...          # Get from LiqPay
LIQPAY_PRIVATE_KEY=pr_...         # Get from LiqPay
FRONTEND_URL=https://yourdomain.com
BACKEND_URL=https://yourdomain.com/api
COMPANY_NAME=Your Store Name

# 3. Start the application
npm run start:dev
```

#### LiqPay Setup (10 minutes):
1. Go to [LiqPay](https://www.liqpay.ua/) and register
2. Get your public/private keys from dashboard
3. Set webhook URL: `https://yourdomain.com/api/payments/liqpay/webhook`
4. Enable sandbox mode for testing
5. Test with small amounts first

#### Production Deployment:
```bash
# Build for production
npm run build

# Start production server
npm run start:prod

# Set NODE_ENV=production in your hosting panel
```

### 2. Environment Variables
Add these to your `.env` file:

```bash
# LiqPay Configuration
LIQPAY_PUBLIC_KEY=pk_...          # Your LiqPay public key
LIQPAY_PRIVATE_KEY=pr_...         # Your LiqPay private key

# Application URLs
FRONTEND_URL=http://localhost:4200
BACKEND_URL=http://localhost:3002/api
COMPANY_NAME=3D Store

# Database (already configured)
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=ecommerce_db
```

### 3. Database Migration
The Payment entity will be automatically created when you restart the application.

## 🔧 Configuration

### LiqPay Setup
1. Register at [LiqPay](https://www.liqpay.ua/)
2. Get your public and private keys
3. Configure webhook URL: `https://yourdomain.com/api/payments/liqpay/webhook`
4. Set sandbox mode for development

### Payment Methods
Currently supported:
- **LiqPay** - UAH, USD, EUR
- **Future**: Stripe, PayPal

## 📡 API Endpoints

### Create Payment
```http
POST /api/payments
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "orderId": 123,
  "amount": 1500.00,
  "currency": "UAH",
  "paymentMethod": "liqpay",
  "description": "Order #123 payment",
  "customerEmail": "customer@example.com"
}
```

### LiqPay Webhook
```http
POST /api/payments/liqpay/webhook
Content-Type: application/json
x-liqpay-signature: <signature>

{
  "data": "base64_encoded_data"
}
```

### Get Payment
```http
GET /api/payments/:id
Authorization: Bearer <jwt_token>
```

### Get Order Payments
```http
GET /api/payments/order/:orderId
Authorization: Bearer <jwt_token>
```

### Get All Payments (Admin)
```http
GET /api/payments
Authorization: Bearer <jwt_token>
```

### Get Payment Statistics (Admin)
```http
GET /api/payments/stats/overview
Authorization: Bearer <jwt_token>
```

## 🔄 Payment Flow

### 1. Create Payment
- User adds items to cart
- User clicks "Place Order"
- System creates payment record
- Returns LiqPay payment data

### 2. Process Payment
- User completes payment on LiqPay
- LiqPay sends webhook to backend
- Backend processes webhook
- Updates payment and order status
- Sends email notifications

### 3. Payment Statuses
- `pending` - Payment created, waiting for user
- `processing` - Payment in progress
- `completed` - Payment successful
- `failed` - Payment failed
- `refunded` - Payment refunded
- `cancelled` - Payment cancelled

## 🧪 Testing

### Test LiqPay Integration
1. Use sandbox mode for development
2. Test webhook with Postman/Insomnia
3. Verify signature validation
4. Check payment status updates

### Testing for Development
```bash
# 1. Set sandbox mode
NODE_ENV=development  # This enables LiqPay sandbox

# 2. Test payment creation
curl -X POST http://localhost:3002/api/payments \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": 1,
    "amount": 100.00,
    "currency": "UAH",
    "paymentMethod": "liqpay"
  }'

# 3. Test webhook (simulate LiqPay)
curl -X POST http://localhost:3002/api/payments/liqpay/webhook \
  -H "Content-Type: application/json" \
  -H "x-liqpay-signature: test_signature" \
  -d '{
    "data": "eyJvcmRlcl9pZCI6IjEiLCJzdGF0dXMiOiJzdWNjZXNzIiwiYW1vdW50IjoxMDAuMCwiY3VycmVuY3kiOiJVQUgifQ=="
  }'
```

### Testing for Production
```bash
# 1. Set production mode
NODE_ENV=production

# 2. Use real LiqPay keys
LIQPAY_PUBLIC_KEY=pk_prod_...
LIQPAY_PRIVATE_KEY=pr_prod_...

# 3. Test with real payments (small amounts)
# 4. Monitor webhook delivery
# 5. Check payment status updates
```

### Test Payment Flow
1. Create test order
2. Create payment
3. Simulate webhook
4. Verify notifications

## 📧 Email Notifications

The system automatically sends notifications for:
- Payment created
- Payment successful
- Payment failed
- Order confirmation
- Order status updates

## 🔒 Security

- **JWT Authentication** required for payment creation
- **Admin Guard** required for payment management
- **Webhook Signature** validation for LiqPay
- **Input Validation** using class-validator

## 🚨 Error Handling

All errors are logged and sent as notifications:
- Invalid payment data
- Webhook signature mismatch
- Database errors
- External API failures

## 📊 Monitoring

Track payment performance with:
- Total payments count
- Success rate
- Total amount processed
- Payment method distribution

## 🔮 Future Enhancements

- **Stripe Integration** - Credit card payments
- **PayPal Integration** - PayPal wallet
- **Multi-currency Support** - More currencies
- **Payment Analytics** - Detailed reports
- **Refund Processing** - Handle refunds
- **Subscription Payments** - Recurring billing

## 🛒 For ThemeForest Customers

### Quick Start Guide
1. **Download** the template files
2. **Install** dependencies: `npm install`
3. **Configure** LiqPay in `.env` file
4. **Test** with sandbox mode
5. **Deploy** to your hosting

### Environment Configuration
```bash
# Copy template
cp .env.example .env

# Required for LiqPay
LIQPAY_PUBLIC_KEY=pk_...          # From LiqPay dashboard
LIQPAY_PRIVATE_KEY=pr_...         # From LiqPay dashboard

# Your store settings
FRONTEND_URL=https://yourdomain.com
BACKEND_URL=https://yourdomain.com/api
COMPANY_NAME=Your Store Name

# Database (already configured)
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=ecommerce_db
```

### Testing Checklist
- [ ] LiqPay sandbox mode enabled
- [ ] Payment creation works
- [ ] Webhook receives notifications
- [ ] Order status updates correctly
- [ ] Email notifications sent
- [ ] Admin panel shows payments

### Support
- **Documentation**: Check this README
- **Issues**: Create GitHub issue
- **Email**: support@yourstore.com

## 🆘 Troubleshooting

### Common Issues

1. **LiqPay Keys Not Working**
   - Check environment variables
   - Verify key format
   - Test in sandbox mode

2. **Webhook Not Receiving**
   - Check webhook URL
   - Verify server accessibility
   - Check firewall settings

3. **Payment Status Not Updating**
   - Check webhook processing
   - Verify database connections
   - Check notification service

### Debug Mode
Enable debug logging in your environment:
```bash
NODE_ENV=development
LOG_LEVEL=debug
```

## 📚 Resources

- [LiqPay Documentation](https://www.liqpay.ua/en/doc)
- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/) 