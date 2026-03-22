import { environment } from '../../../environments/environment';

export function fixBackendUrl(url: string | undefined): string {
  if (!url) return '';
  
  // If we are not on localhost, but the URL points to localhost:3002, fix it
  if (typeof window !== 'undefined' && 
      window.location.hostname !== 'localhost' && 
      window.location.hostname !== '127.0.0.1' && 
      url.includes('localhost:3002')) {
    const backendBaseUrl = environment.apiUrl.replace('/api', '');
    return url.replace('http://localhost:3002', backendBaseUrl);
  }
  
  return url;
}
