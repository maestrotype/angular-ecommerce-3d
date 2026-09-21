/** Full-quality fashion GLB assets (photogrammetry sources, ~25–40 MB). */
export const DEMO_BAG_GLB = 'assets/models/bag/bag3.glb';
export const DEMO_SHOES_GLB = 'assets/models/shoes/shoes1.glb';

/** Hard limit for any stored/served GLB in the app. */
export const MAX_STORED_GLB_BYTES = 50 * 1024 * 1024;

export const LEGACY_DUCK_GLB = 'assets/demo/models/duck.glb';

/** Compressed/low-quality aliases and legacy paths → HQ bundled assets. */
const BUNDLED_MODEL_ALIASES: Record<string, string> = {
  'assets/demo/models/bag-catalog.glb': DEMO_BAG_GLB,
  'assets/demo/models/bag-demo.glb': DEMO_BAG_GLB,
  'assets/demo/models/shoes-catalog.glb': DEMO_SHOES_GLB,
  'assets/demo/models/shoes-demo.glb': DEMO_SHOES_GLB,
  'assets/models/bag/bag1.glb': DEMO_BAG_GLB,
  'assets/models/bag/bag2.glb': DEMO_BAG_GLB,
  'assets/models/bag/bag4.glb': DEMO_BAG_GLB,
};

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

/** Map stale DB/cache paths to the current HQ bundled GLB. */
export function resolveBundledModelPath(path: string | null | undefined): string {
  if (!path) {
    return '';
  }
  const trimmed = path.trim();
  if (BUNDLED_MODEL_ALIASES[trimmed]) {
    return BUNDLED_MODEL_ALIASES[trimmed];
  }
  if (trimmed.includes('bag-catalog.glb') || trimmed.includes('bag-demo.glb')) {
    return DEMO_BAG_GLB;
  }
  if (trimmed.includes('shoes-catalog.glb') || trimmed.includes('shoes-demo.glb')) {
    return DEMO_SHOES_GLB;
  }
  return trimmed;
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
  return url.includes('assets/demo/models/') && !url.includes('duck.glb');
}
