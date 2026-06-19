import { resolveApiUrl } from '../app/core/utils/api-url.util';

export const environment = {
  production: false,
  get apiUrl() {
    return resolveApiUrl();
  },
  fallbackApiUrl: 'https://angular-ecommerce-backend.onrender.com/api',
  stripePublishableKey: 'pk_test_mock_key_for_testing_only',
  paypalClientId: 'mock_paypal_client_id_for_testing'
};
