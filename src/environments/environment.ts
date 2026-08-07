import { resolveApiUrl } from '../app/core/utils/api-url.util';
import type { AdminLoginPrefill } from './environment.types';

export type { AdminLoginPrefill } from './environment.types';

export const environment = {
  production: false,
  get apiUrl() {
    return resolveApiUrl();
  },
  fallbackApiUrl: 'https://angular-ecommerce-backend.onrender.com/api',
  /** Configure Stripe/PayPal in Admin → Settings; env keys are optional fallbacks. */
  stripePublishableKey: '',
  paypalClientId: '',
  adminLoginPrefill: {
    email: '',
    password: '',
  } satisfies AdminLoginPrefill,
};
