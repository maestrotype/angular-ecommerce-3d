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

  if (isCloudinaryUrl(url)) return url;

  const apiBase = environment.apiUrl;
  const backendBaseUrl = apiBase.endsWith('/api') ? apiBase.substring(0, apiBase.length - 4) : apiBase;

  let normalized = url.replace('/uploads/models/', '/uploads/products-3d/');
  if (normalized.includes('localhost:4200/uploads/')) {
    normalized = normalized.replace(/https?:\/\/localhost:4200/, backendBaseUrl);
  }
  if (normalized.startsWith('/uploads/')) {
    return `${backendBaseUrl}${normalized}`;
  }

  // Local / Render ephemeral URLs only work where the file actually exists — never rewrite to production backend.
  if (isLegacyLocalUrl(normalized)) {
    return normalized;
  }

  if (url.startsWith('http') && !url.includes(backendBaseUrl)) {
    return url;
  }

  let resultUrl = normalized;
  if (!url.startsWith('http') && !url.startsWith('assets/')) {
    resultUrl = `${backendBaseUrl}/${url.replace(/^\//, '')}`;
  }

  if (resultUrl.includes(backendBaseUrl) &&
      !resultUrl.includes('/api/') &&
      !resultUrl.includes('assets/')) {
    const isAssetFile = /\.(glb|gltf|jpg|jpeg|png|webp|svg)$/i.test(resultUrl);
    if (isAssetFile && !resultUrl.includes('/uploads/')) {
      const pathPart = resultUrl.replace(backendBaseUrl, '').replace(/^\//, '');
      const folder = pathPart.includes('ai-gen') || pathPart.endsWith('.glb')
        ? 'uploads/products-3d'
        : 'uploads';
      return `${backendBaseUrl}/${folder}/${pathPart}`;
    }
  }

  return resultUrl;
}
