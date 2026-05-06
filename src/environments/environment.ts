export const environment = {
  production: false,
  get apiUrl() {
    const useLocal = typeof localStorage !== 'undefined' && localStorage.getItem('use_local_api') === 'true';
    if (useLocal) return 'http://localhost:3002/api';
    return 'https://angular-ecommerce-backend.onrender.com/api';
  },
  fallbackApiUrl: 'https://angular-ecommerce-backend.onrender.com/api',
  stripePublishableKey: 'pk_test_mock_key_for_testing_only',
  paypalClientId: 'mock_paypal_client_id_for_testing'
};
