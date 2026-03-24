import { environment } from '../../../environments/environment';

export function fixBackendUrl(url: string | undefined): string {
  if (!url) return '';
  
  // If it's already a full external URL (like Cloudinary), don't touch it
  if (url.startsWith('http') && !url.includes('localhost:3002') && !url.includes('onrender.com')) {
    return url;
  }

  const backendBaseUrl = environment.apiUrl.replace('/api', '').replace(/\/$/, '');
  
  // 1. Resolve relative paths and local dev URLs
  let resultUrl = url;
  if (url.includes('localhost:3002')) {
    // If it's a local dev URL, swap it for the current environment's backend base
    resultUrl = url.replace(/https?:\/\/localhost:3002/, backendBaseUrl);
  } else if (!url.startsWith('http') && !url.startsWith('assets/')) {
    // If it's a relative path, prepend backend base
    resultUrl = `${backendBaseUrl}/${url.replace(/^\//, '')}`;
  }

  // 2. Ensure /uploads/ is present for assets that are known to be in the uploads folder
  // but only for paths rooted in our backend
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
