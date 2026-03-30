import { environment } from '../../../environments/environment';

/**
 * Returns true if the URL is a Cloudinary-hosted URL (safe on any environment).
 */
export function isCloudinaryUrl(url: string | undefined): boolean {
  if (!url) return false;
  return url.includes('res.cloudinary.com');
}

/**
 * Returns true if the URL is a legacy local-disk URL that only worked when
 * the app and backend were running on the same machine.
 * These URLs cannot be resolved when the app is deployed to a server unless
 * whoever uploaded the model was on that exact server instance.
 */
export function isLegacyLocalUrl(url: string | undefined): boolean {
  if (!url) return false;
  // Cloudinary URLs are fine
  if (isCloudinaryUrl(url)) return false;
  // Local disk paths (relative) or localhost URLs
  if (url.startsWith('/uploads/') || url.includes('localhost:')) return true;
  // Render.com serving static files from its ephemeral disk
  if (url.includes('onrender.com') && url.includes('/uploads/')) return true;
  return false;
}

/**
 * Normalises a model/image URL so it can be loaded by the browser.
 * - Cloudinary URLs → returned as-is (always absolute and accessible)
 * - Localhost URLs → rewritten to the current environment backend base
 * - Relative paths → prepended with the backend base URL
 */
export function fixBackendUrl(url: string | undefined): string {
  if (!url) return '';

  // Cloudinary or any other external CDN — return as-is
  if (isCloudinaryUrl(url)) return url;

  // Any other fully-qualified http URL that isn't localhost — return as-is
  if (url.startsWith('http') && !url.includes('localhost:3002')) {
    return url;
  }

  const backendBaseUrl = environment.apiUrl.replace('/api', '').replace(/\/$/, '');

  let resultUrl = url;
  if (url.includes('localhost:3002')) {
    // Swap localhost for the current environment's backend base
    resultUrl = url.replace(/https?:\/\/localhost:3002/, backendBaseUrl);
  } else if (!url.startsWith('http') && !url.startsWith('assets/')) {
    // Relative path — prepend backend base
    resultUrl = `${backendBaseUrl}/${url.replace(/^\//, '')}`;
  }

  // Ensure /uploads/ is present for asset files rooted at our backend
  if (resultUrl.includes(backendBaseUrl) &&
      !resultUrl.includes('/uploads/') &&
      !resultUrl.includes('/api/') &&
      !resultUrl.includes('assets/')) {
    const isAssetFile = /\.(glb|gltf|jpg|jpeg|png|webp|svg)$/i.test(resultUrl);
    if (isAssetFile) {
      const pathPart = resultUrl.replace(backendBaseUrl, '').replace(/^\//, '');
      return `${backendBaseUrl}/uploads/${pathPart}`;
    }
  }

  return resultUrl;
}
