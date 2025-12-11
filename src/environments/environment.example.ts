/**
 * Environment configuration example
 * Copy this file to environment.ts and environment.prod.ts
 * 
 * API URL is auto-detected based on hostname:
 * - localhost/127.0.0.1 -> local backend (http://localhost:3002/api)
 * - any other domain -> production backend
 */
const isLocalhost = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export const environment = {
  production: false, // Set to true for environment.prod.ts
  
  // Auto-detect API URL based on hostname
  apiUrl: isLocalhost 
    ? 'http://localhost:3002/api' 
    : 'https://your-production-api.com/api',
  
  // Payment keys (use test keys for development)
  stripePublishableKey: 'pk_test_your_stripe_key',
  paypalClientId: 'your_paypal_client_id'
};
