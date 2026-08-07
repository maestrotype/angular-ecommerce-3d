const INSECURE_JWT_SECRETS = new Set([
  '',
  'your_jwt_secret_change_in_production',
  'your_jwt_secret_min_32_chars',
  'generate_a_random_32_character_secret_key_here',
  'your-super-secret-jwt-key',
]);

/**
 * Fail fast when production is started with placeholder or missing secrets.
 */
export function assertProductionSecrets(): void {
  if (process.env.NODE_ENV !== 'production') {
    return;
  }

  const jwtSecret = process.env.JWT_SECRET?.trim();
  if (!jwtSecret || jwtSecret.length < 32 || INSECURE_JWT_SECRETS.has(jwtSecret)) {
    console.error(
      '[Security] FATAL: JWT_SECRET must be a unique value of at least 32 characters in production.',
    );
    console.error('[Security] Generate one with: openssl rand -base64 48');
    process.exit(1);
  }
}
