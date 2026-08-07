import { resolveApiUrl } from '../app/core/utils/api-url.util';
import type { AdminLoginPrefill } from './environment';

export const environment = {
  production: true,
  get apiUrl() {
    return resolveApiUrl();
  },
  /** Payment keys are loaded from Admin → Settings at runtime. Keep empty in production builds. */
  stripePublishableKey: '',
  paypalClientId: '',
  adminLoginPrefill: {
    email: '',
    password: '',
  } satisfies AdminLoginPrefill,
};
