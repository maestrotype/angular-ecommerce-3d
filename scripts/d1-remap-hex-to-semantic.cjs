#!/usr/bin/env node
/**
 * D1 helper: remap hardcoded hex (+ legacy var fallbacks) → semantic tokens
 * in shop/home (and similar) component SCSS.
 *
 * Usage: node scripts/d1-remap-hex-to-semantic.cjs <file> [file...]
 */
const fs = require('fs');

function stripHexFallbacks(css) {
  return css.replace(/var\(\s*(--[\w-]+)\s*,\s*#[0-9a-fA-F]{3,8}\s*\)/g, 'var($1)');
}

function remapLegacyVars(css) {
  const renames = [
    ['--color-surface-primary', '--surface-primary'],
    ['--color-surface-secondary', '--surface-secondary'],
    ['--color-text-primary', '--text-primary'],
    ['--color-text-secondary', '--text-secondary'],
    ['--color-primary-hover', '--interactive-primary-hover'],
    ['--color-primary', '--interactive-primary'],
    ['--bg-primary', '--surface-primary'],
    ['--bg-secondary', '--surface-secondary'],
  ];
  // Longer keys first
  renames.sort((a, b) => b[0].length - a[0].length);
  for (const [from, to] of renames) {
    css = css.split(from).join(to);
  }
  // bare --border (not --border-*) used as var(--border)
  css = css.replace(/var\(\s*--border\s*\)/g, 'var(--border-default)');
  return css;
}

function remapHex(css) {
  // Contextual: backgrounds
  const bgPairs = [
    [/#0f172a\b/gi, 'var(--surface-page)'],
    [/#1e293b\b/gi, 'var(--surface-elevated)'],
    [/#334155\b/gi, 'var(--surface-highlight)'],
    [/#f8fafc\b/gi, 'var(--surface-page)'],
    [/#f8f9fa\b/gi, 'var(--surface-secondary)'],
    [/#f5f5f5\b/gi, 'var(--surface-page)'],
    [/#ffffff\b/gi, 'var(--surface-elevated)'],
    [/#e9ecef\b/gi, 'var(--surface-highlight)'],
    [/#007bff\b/gi, 'var(--interactive-primary)'],
    [/#2563eb\b/gi, 'var(--interactive-primary-hover)'],
    [/#3b82f6\b/gi, 'var(--interactive-primary)'],
    [/#ef4444\b/gi, 'var(--interactive-danger)'],
    [/#dc2626\b/gi, 'var(--color-error-hover)'],
    [/#ff6347\b/gi, 'var(--accent-warm)'],
    [/#ff6b6b\b/gi, 'var(--accent-warm)'],
    [/#FF6B6B\b/g, 'var(--accent-warm)'],
    [/#4ecdc4\b/gi, 'var(--accent-banner-start)'],
    [/#f0f0f0\b/gi, 'var(--skeleton-bg)'],
    [/#e0e0e0\b/gi, 'var(--skeleton-bg-dark)'],
    [/#e8e8e8\b/gi, 'var(--skeleton-bg-dark)'],
    [/#2d2d2d\b/gi, 'var(--skeleton-bg-dark)'],
    [/#3a3a3a\b/gi, 'var(--skeleton-bg)'],
    [/#1a1a1a\b/gi, 'var(--surface-page)'],
  ];

  css = css.replace(
    /(background(?:-color)?\s*:\s*)([^;{}]+)/gi,
    (full, prop, value) => {
      let v = value;
      for (const [re, tok] of bgPairs) v = v.replace(re, tok);
      // white keyword in background
      v = v.replace(/\bwhite\b/gi, 'var(--text-inverse)');
      return prop + v;
    }
  );

  // linear-gradient / other properties still holding hex
  const general = [
    [/#e2e8f0\b/gi, 'var(--border-default)'],
    [/#dee2e6\b/gi, 'var(--border-default)'],
    [/#e5e7eb\b/gi, 'var(--border-default)'],
    [/#adb5bd\b/gi, 'var(--border-emphasis)'],
    [/#475569\b/gi, 'var(--border-emphasis)'],
    [/#334155\b/gi, 'var(--border-strong)'],
    [/#cbd5e1\b/gi, 'var(--text-muted)'],
    [/#94a3b8\b/gi, 'var(--text-muted)'],
    [/#64748b\b/gi, 'var(--text-secondary)'],
    [/#666\b/gi, 'var(--text-secondary)'],
    [/#333\b/gi, 'var(--text-primary)'],
    [/#374151\b/gi, 'var(--text-primary)'],
    [/#1e293b\b/gi, 'var(--text-primary)'],
    [/#0f172a\b/gi, 'var(--text-primary)'],
    [/#f8fafc\b/gi, 'var(--text-primary)'],
    [/#ffffff\b/gi, 'var(--text-on-primary)'],
    [/#fbbf24\b/gi, 'var(--color-rating-star)'],
    [/#6366f1\b/gi, 'var(--interactive-accent)'],
    [/#3b82f6\b/gi, 'var(--interactive-primary)'],
    [/#2563eb\b/gi, 'var(--interactive-primary-hover)'],
    [/#007bff\b/gi, 'var(--interactive-primary)'],
    [/#ef4444\b/gi, 'var(--interactive-danger)'],
    [/#dc2626\b/gi, 'var(--color-error-hover)'],
    [/#FF6B6B\b/g, 'var(--accent-warm)'],
    [/#ff6b6b\b/gi, 'var(--accent-warm)'],
    [/#ff6347\b/gi, 'var(--accent-warm)'],
    [/#4ecdc4\b/gi, 'var(--accent-banner-start)'],
    [/#f0f0f0\b/gi, 'var(--skeleton-bg)'],
    [/#e0e0e0\b/gi, 'var(--skeleton-bg-dark)'],
    [/#f5f5f5\b/gi, 'var(--surface-page)'],
    [/#f8f9fa\b/gi, 'var(--surface-secondary)'],
    [/#2d2d2d\b/gi, 'var(--skeleton-bg-dark)'],
    [/#3a3a3a\b/gi, 'var(--skeleton-bg)'],
    [/#1a1a1a\b/gi, 'var(--surface-page)'],
  ];

  for (const [re, tok] of general) {
    css = css.replace(re, tok);
  }

  // color: white → on-primary (filled buttons / icons)
  css = css.replace(/(\bcolor\s*:\s*)white\b/gi, '$1var(--text-on-primary)');

  return css;
}

function processFile(file) {
  const before = fs.readFileSync(file, 'utf8');
  let css = before;
  css = stripHexFallbacks(css);
  css = remapLegacyVars(css);
  css = remapHex(css);
  // Home banner shorthand
  css = css.replace(
    /background:\s*linear-gradient\(135deg,\s*var\(--accent-banner-start\)\s*0%,\s*var\(--accent-warm\)\s*100%\)/g,
    'background: var(--gradient-banner)'
  );
  if (css !== before) {
    fs.writeFileSync(file, css);
    const hexBefore = (before.match(/#[0-9a-fA-F]{3,8}\b/g) || []).length;
    const hexAfter = (css.match(/#[0-9a-fA-F]{3,8}\b/g) || []).length;
    console.log(`${file}: hex ${hexBefore} → ${hexAfter}`);
  } else {
    console.log(`${file}: unchanged`);
  }
}

const files = process.argv.slice(2);
if (!files.length) {
  console.error('Usage: node scripts/d1-remap-hex-to-semantic.cjs <file>...');
  process.exit(1);
}
files.forEach(processFile);
