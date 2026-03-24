import { environment } from '../../../environments/environment';

export function fixBackendUrl(url: string | undefined): string {
  if (!url) return '';
  
  const backendBaseUrl = environment.apiUrl.replace('/api', '').replace(/\/$/, '');
  
  // 1. Resolve domain and basic absolute path
  let resultUrl = url;
  if (url.includes('localhost:3002')) {
    resultUrl = url.replace(/https?:\/\/localhost:3002/, backendBaseUrl);
  } else if (!url.startsWith('http') && !url.startsWith('assets/')) {
    resultUrl = `${backendBaseUrl}/${url.replace(/^\//, '')}`;
  }

  // 2. Special handling for backend assets (models/images)
  // If it's a backend file but missing /uploads/ and isn't an API or local asset
  if (resultUrl.includes(backendBaseUrl) && 
      !resultUrl.includes('/uploads/') && 
      !resultUrl.includes('/api/') &&
      !resultUrl.includes('assets/')) {
    
    // Check if it's a file that should be in uploads (models or images)
    const isAssetFile = /\.(glb|gltf|jpg|jpeg|png|webp|svg)$/i.test(resultUrl);
    
    if (isAssetFile) {
      // Find the path part after the backendBaseUrl
      let pathPart = resultUrl.replace(backendBaseUrl, '');
      // Remove leading slash if present
      pathPart = pathPart.replace(/^\//, '');
      return `${backendBaseUrl}/uploads/${pathPart}`;
    }
  }
  
  return resultUrl;
}
