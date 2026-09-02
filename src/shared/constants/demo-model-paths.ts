/** Optimized GLB assets for fashion demo SKUs (bags / shoes). */
export const DEMO_BAG_GLB = 'assets/demo/models/bag-demo.glb';
export const DEMO_SHOES_GLB = 'assets/demo/models/shoes-demo.glb';

/** Hard limit for any stored/served GLB in the app. */
export const MAX_STORED_GLB_BYTES = 50 * 1024 * 1024;

export const LEGACY_DUCK_GLB = 'assets/demo/models/duck.glb';

const LEGACY_LARGE_MODEL_PREFIXES = [
  'assets/models/bag/',
  'assets/models/shoes/',
  LEGACY_DUCK_GLB,
];

export function demoGlbForCategory(category: string | null | undefined): string | undefined {
  const key = (category || '').trim().toLowerCase();
  if (key === 'bags' || key === 'handbags') {
    return DEMO_BAG_GLB;
  }
  if (key === 'shoes') {
    return DEMO_SHOES_GLB;
  }
  return undefined;
}

export function isLegacyDuckModelUrl(url: string | null | undefined): boolean {
  if (!url) {
    return false;
  }
  return url.includes('duck.glb');
}

export function isLegacyUnoptimizedDemoModelUrl(url: string | null | undefined): boolean {
  if (!url) {
    return false;
  }
  return LEGACY_LARGE_MODEL_PREFIXES.some((prefix) => url.includes(prefix));
}
