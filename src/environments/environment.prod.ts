import { resolveApiUrl } from '../app/core/utils/api-url.util';

export const environment = {
  production: true,
  get apiUrl() {
    return resolveApiUrl();
  },
  stripePublishableKey: 'pk_test_mock_key_for_testing_only',
  paypalClientId: 'mock_paypal_client_id_for_testing'
};
