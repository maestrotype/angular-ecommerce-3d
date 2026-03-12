import { environment } from '../../environments/environment';

/**
 * Resolves an image URL. If the URL is relative (starts with 'uploads/'), 
 * it prepends the backend base URL.
 * 
 * @param url The image URL or partial path
 * @returns The resolved absolute URL or original URL if it's already absolute or a data URI
 */
export function resolveImageUrl(url: string | undefined | null): string {
    if (!url) {
        return 'assets/icons/default-category.svg';
    }

    // If it's already an absolute URL (http/https) or a data URI, return as is
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
        return url;
    }

    // If it's a relative path from the backend (starts with 'uploads/')
    if (url.startsWith('uploads/')) {
        // Strip trailing slash from apiUrl if it exists
        const baseApiUrl = environment.apiUrl.endsWith('/api')
            ? environment.apiUrl.slice(0, -4)
            : environment.apiUrl;

        return `${baseApiUrl}/${url}`;
    }

    // If it's a local asset path, return as is
    if (url.startsWith('assets/')) {
        return url;
    }

    return url;
}
