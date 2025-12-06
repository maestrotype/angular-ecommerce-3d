/**
 * Environment Configuration Example
 * Copy to environment.ts (dev) or environment.prod.ts (prod)
 */
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3002/api',
  fallbackApiUrl: 'https://your-backup-backend.com/api',
  stripePublishableKey: 'pk_test_YOUR_STRIPE_KEY_HERE',
  paypalClientId: 'YOUR_PAYPAL_CLIENT_ID_HERE',
};
