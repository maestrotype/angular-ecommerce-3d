/**
 * Environment configuration example
 *
 * Copy values into environment.ts (development) or environment.prod.ts (production).
 * Payment keys are normally configured in Admin → Settings / Integrations.
 */
import type { AdminLoginPrefill } from './environment.types';

export const environment = {
  production: false,

  apiUrl: 'http://localhost:3002/api',

  stripePublishableKey: '',
  paypalClientId: '',

  adminLoginPrefill: {
    email: '',
    password: '',
  } satisfies AdminLoginPrefill,
};
