import { resolveApiUrl } from '../app/core/utils/api-url.util';

/** Optional local-only login prefill (leave empty before commit). */
export interface AdminLoginPrefill {
  email: string;
  password: string;
}

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
