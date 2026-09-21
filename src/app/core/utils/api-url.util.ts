const LOCAL_API_URL = 'http://localhost:3002/api';
/** Fallback for GitHub Pages (no /api reverse proxy on static hosting). */
const PROD_API_URL = 'https://angular-ecommerce-backend.onrender.com/api';

function isLocalhost(): boolean {
  return typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
}

function isGitHubPages(): boolean {
  return typeof window !== 'undefined' && window.location.hostname.endsWith('github.io');
}

/** Same-origin API when nginx/VPS proxies `/api` (Docker Compose, single-domain demo). */
function sameOriginApiUrl(): string {
  if (typeof window === 'undefined') {
    return PROD_API_URL;
  }
  return `${window.location.origin}/api`;
}

/**
 * Resolve API base URL:
 * - localStorage `use_local_api=true` → localhost Nest
 * - localhost / 127.0.0.1 → localhost Nest
 * - github.io → hosted Render fallback
 * - otherwise → same-origin `/api` (Docker / reverse-proxied demos)
 */
export function resolveApiUrl(): string {
  const pref = typeof localStorage !== 'undefined' ? localStorage.getItem('use_local_api') : null;

  if (pref === 'true') {
    return LOCAL_API_URL;
  }
  if (pref === 'false') {
    return isGitHubPages() ? PROD_API_URL : sameOriginApiUrl();
  }
  if (isLocalhost()) {
    return LOCAL_API_URL;
  }
  if (isGitHubPages()) {
    return PROD_API_URL;
  }
  return sameOriginApiUrl();
}

export function isLocalApiPreferred(): boolean {
  const pref = typeof localStorage !== 'undefined' ? localStorage.getItem('use_local_api') : null;
  return pref === 'true' || (pref === null && isLocalhost());
}

export function setApiPreference(useLocal: boolean): void {
  localStorage.setItem('use_local_api', useLocal ? 'true' : 'false');
}

export { LOCAL_API_URL, PROD_API_URL };
