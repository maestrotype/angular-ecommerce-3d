const LOCAL_API_URL = 'http://localhost:3002/api';
const PROD_API_URL = 'https://angular-ecommerce-backend.onrender.com/api';

function isLocalhost(): boolean {
  return typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
}

export function resolveApiUrl(): string {
  const pref = typeof localStorage !== 'undefined' ? localStorage.getItem('use_local_api') : null;

  if (pref === 'true' || (pref === null && isLocalhost())) {
    return LOCAL_API_URL;
  }
  return PROD_API_URL;
}

export function isLocalApiPreferred(): boolean {
  const pref = typeof localStorage !== 'undefined' ? localStorage.getItem('use_local_api') : null;
  return pref === 'true' || (pref === null && isLocalhost());
}

export function setApiPreference(useLocal: boolean): void {
  localStorage.setItem('use_local_api', useLocal ? 'true' : 'false');
}

export { LOCAL_API_URL, PROD_API_URL };
