export const environment = {
  production: true,
  get apiUrl() {
    const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    return isLocal ? 'http://localhost:3002/api' : 'https://angular-ecommerce-backend.onrender.com/api';
  },
  stripePublishableKey: 'pk_test_mock_key_for_testing_only',
  paypalClientId: 'mock_paypal_client_id_for_testing'
};
