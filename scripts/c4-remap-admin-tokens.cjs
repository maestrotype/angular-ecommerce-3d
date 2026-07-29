#!/usr/bin/env node
/**
 * C4 helper: remap --admin-* → semantic tokens in component files.
 * Keeps ADMIN-ONLY layout tokens. Longest-key-first replacement.
 * Usage: node scripts/c4-remap-admin-tokens.mjs <file> [file...]
 */
const fs = require('fs');
const path = require('path');

const map = {
  '--admin-primary-hover': '--interactive-primary-hover',
  '--admin-primary-light': '--color-brand-light',
  '--admin-primary-dark': '--color-brand-dark',
  '--admin-primary-rgb': '--interactive-primary-rgb',
  '--admin-tab-active': '--interactive-primary',
  '--admin-primary': '--interactive-primary',
  '--admin-secondary-hover': '--color-accent-pink',
  '--admin-secondary-light': '--color-accent-pink',
  '--admin-secondary-dark': '--color-accent-pink',
  '--admin-secondary': '--color-accent-pink',
  '--admin-accent-primary': '--color-accent',
  '--admin-accent': '--color-accent',
  '--admin-success-hover': '--color-success-hover',
  '--admin-success-light': '--color-success-light',
  '--admin-success-dark': '--color-success-dark',
  '--admin-status-success': '--color-success',
  '--admin-success': '--color-success',
  '--admin-warning-hover': '--color-warning-hover',
  '--admin-warning-light': '--color-warning-light',
  '--admin-warning-dark': '--color-warning-dark',
  '--admin-warning': '--color-warning',
  '--admin-warn': '--color-warning',
  '--admin-error-hover': '--color-error-hover',
  '--admin-error-light': '--color-error-light',
  '--admin-error-dark': '--color-error-dark',
  '--admin-error': '--interactive-danger',
  '--admin-info-hover': '--color-info-hover',
  '--admin-info-light': '--color-blue-400',
  '--admin-info-dark': '--color-blue-600',
  '--admin-info': '--color-info',
  '--admin-danger': '--interactive-danger',
  '--admin-button-hover': '--interactive-primary-hover',
  '--admin-button-text': '--interactive-primary-text',
  '--admin-button-muted-hover': '--interactive-secondary-hover',
  '--admin-button-muted': '--interactive-secondary',
  '--admin-button': '--interactive-button',
  '--admin-submit-btn-hover': '--interactive-primary-hover',
  '--admin-submit-btn-disabled': '--interactive-disabled',
  '--admin-submit-btn-text': '--interactive-primary-text',
  '--admin-submit-btn': '--interactive-primary',
  '--admin-cancel-btn-hover': '--color-slate-600',
  '--admin-cancel-btn-text': '--text-inverse',
  '--admin-cancel-btn': '--color-secondary-base',
  '--admin-back-btn': '--surface-highlight',
  '--admin-bg-secondary': '--surface-secondary',
  '--admin-bg-tertiary': '--surface-tertiary',
  '--admin-bg-card-rgb': '--surface-elevated-rgb',
  '--admin-bg-card': '--surface-elevated',
  '--admin-bg-hover': '--surface-highlight',
  '--admin-bg-overlay': '--surface-overlay-full',
  '--admin-bg-main': '--surface-page',
  '--admin-bg-container': '--surface-page',
  '--admin-bg-glass': '--glass-bg',
  '--admin-bg-primary': '--surface-page',
  '--admin-popup-bg': '--surface-elevated',
  '--admin-basic-bg': '--surface-elevated',
  '--admin-product-card-bg': '--surface-card',
  '--admin-message-info-bg': '--color-info-bg',
  '--admin-basic-translucent': '--surface-overlay-light',
  '--admin-dark-translucent': '--surface-overlay-hover',
  '--admin-light-translucent': '--surface-overlay-light',
  '--admin-text-secondary': '--text-secondary',
  '--admin-text-tertiary': '--text-muted',
  '--admin-text-disabled-rgb': '--text-muted-rgb',
  '--admin-text-disabled': '--text-muted',
  '--admin-text-inverse': '--text-inverse',
  '--admin-text-label': '--text-secondary',
  '--admin-text-primary': '--text-primary',
  '--admin-border-secondary': '--border-subtle',
  '--admin-border-focus': '--border-primary',
  '--admin-border-error': '--interactive-danger',
  '--admin-border-color': '--border-default',
  '--admin-border-primary': '--border-default',
  '--admin-header-bg': '--surface-header',
  '--admin-header-blur': '--backdrop-blur',
  '--admin-header-border': '--glass-border-soft',
  '--admin-header-text': '--text-primary',
  '--admin-header-icon-color': '--text-secondary',
  '--admin-input-bg': '--input-bg',
  '--admin-input-text': '--input-text',
  '--admin-input-border': '--input-border',
  '--admin-input-label': '--input-label',
  '--admin-input-placeholder': '--input-placeholder',
  '--admin-input-focus-border': '--input-focus-border',
  '--admin-table-bg': '--surface-table',
  '--admin-table-border': '--border-default',
  '--admin-table-header-bg': '--surface-table-header',
  '--admin-table-header-text': '--text-table-header',
  '--admin-table-row-bg': '--surface-table-row',
  '--admin-table-row-text': '--text-table-row',
  '--admin-table-even-bg': '--surface-table-even',
  '--admin-table-even-text': '--text-table-even',
  '--admin-table-paginator-bg': '--surface-paginator',
  '--admin-table-paginator-text': '--text-paginator',
  '--admin-select-panel-bg': '--surface-select-panel',
  '--admin-selection-bg': '--surface-highlight',
  '--admin-shadow-sm': '--shadow-sm',
  '--admin-shadow-md': '--shadow-md',
  '--admin-shadow-lg': '--shadow-lg',
  '--admin-shadow-xl': '--shadow-xl',
  '--admin-card-shadow': '--shadow-card',
  '--admin-card-gradient': '--surface-card-gradient',
  '--admin-surface-glow': '--surface-glow',
  '--admin-glass-surface-strong': '--glass-surface-strong',
  '--admin-glass-surface-soft': '--glass-surface-soft',
  '--admin-glass-surface-muted': '--glass-surface-muted',
  '--admin-glass-border-strong': '--glass-border-strong',
  '--admin-glass-border-soft': '--glass-border-soft',
  '--admin-glass-divider': '--glass-divider',
  '--admin-glass-highlight': '--glass-highlight',
  '--admin-glass-shadow-lg': '--glass-shadow-lg',
  '--admin-glass-shadow': '--glass-shadow',
  '--admin-glass-inner-shadow': '--glass-inner-shadow',
  '--admin-spacing-xs': '--space-1',
  '--admin-spacing-sm': '--space-2',
  '--admin-spacing-md': '--space-4',
  '--admin-spacing-lg': '--space-6',
  '--admin-spacing-xl': '--space-8',
  '--admin-spacing-xxl': '--space-12',
  '--admin-border-radius-sm': '--radius-sm',
  '--admin-border-radius-md': '--radius-md',
  '--admin-border-radius-lg': '--radius-lg',
  '--admin-border-radius-xl': '--radius-xl',
  '--admin-font-family': '--font-sans',
  '--admin-font-size-xs': '--text-xs',
  '--admin-font-size-sm': '--text-sm',
  '--admin-font-size-md': '--text-base',
  '--admin-font-size-lg': '--text-lg',
  '--admin-font-size-xl': '--text-xl',
  '--admin-font-size-xxl': '--text-2xl',
  '--admin-font-weight-light': '--font-light',
  '--admin-font-weight-normal': '--font-normal',
  '--admin-font-weight-medium': '--font-medium',
  '--admin-font-weight-semibold': '--font-semibold',
  '--admin-font-weight-bold': '--font-bold',
  // Shim value was "duration easing"; compose both so transition: all var(...) stays valid
  '--admin-transition-fast': '--duration-fast) var(--easing-default',
  '--admin-transition-normal': '--duration-normal) var(--easing-default',
  '--admin-transition-slow': '--duration-slow) var(--easing-default',
  '--admin-z-dropdown': '--z-dropdown',
  '--admin-z-sticky': '--z-sticky',
  '--admin-z-fixed': '--z-overlay',
  '--admin-z-modal-backdrop': '--z-overlay',
  '--admin-z-modal': '--z-modal',
  '--admin-z-popover': '--z-modal',
  '--admin-z-tooltip': '--z-toast',
  '--admin-order-detail-header-bg': '--surface-highlight',
  '--admin-order-detail-card-bg': '--surface-secondary',
  '--admin-order-detail-border': '--border-default',
  '--admin-order-detail-text-primary': '--text-primary',
  '--admin-order-detail-text-secondary': '--text-secondary',
  '--admin-order-detail-text-label': '--text-secondary',
  '--admin-order-detail-price-color': '--color-success',
  '--admin-order-detail-total-color': '--color-success',
  '--admin-order-list-bg': '--surface-elevated',
  '--admin-order-list-card-bg': '--surface-secondary',
  '--admin-order-list-border': '--border-default',
  '--admin-order-list-text-primary': '--text-primary',
  '--admin-order-list-text-secondary': '--text-secondary',
  '--admin-order-list-text-label': '--text-secondary',
  '--admin-order-list-header-bg': '--surface-highlight',
  '--admin-order-list-row-hover': '--surface-highlight',
  '--admin-order-list-pagination-bg': '--surface-secondary',
  '--admin-order-list-pagination-border': '--border-default',
  '--admin-order-status-pending': '--color-warning',
  '--admin-order-status-processing': '--color-info',
  '--admin-order-status-shipped': '--color-success',
  '--admin-order-status-delivered': '--color-success',
  '--admin-order-status-cancelled': '--interactive-danger',
  '--admin-avatar-bg': '--color-info-bg',
  '--admin-avatar-color': '--interactive-primary',
};

const keep = new Set([
  '--admin-sidebar-width',
  '--admin-toolbar-height',
  '--admin-content-padding',
  '--admin-mobile-padding-vertical',
  '--admin-mobile-padding-horizontal',
]);

const keys = Object.keys(map).sort((a, b) => b.length - a.length);

const files = process.argv.slice(2);
if (!files.length) {
  console.error('Usage: node scripts/c4-remap-admin-tokens.mjs <file> [file...]');
  process.exit(1);
}

let total = 0;
for (const file of files) {
  let src = fs.readFileSync(file, 'utf8');
  const before = src;
  const placeholders = [];
  for (const k of keep) {
    const re = new RegExp(k.replace(/-/g, '\\-'), 'g');
    src = src.replace(re, (m) => {
      const id = `__KEEP_${placeholders.length}__`;
      placeholders.push(m);
      return id;
    });
  }
  let count = 0;
  for (const k of keys) {
    if (!src.includes(k)) continue;
    const re = new RegExp(k.replace(/-/g, '\\-'), 'g');
    src = src.replace(re, () => {
      count++;
      return map[k];
    });
  }
  for (let i = 0; i < placeholders.length; i++) {
    src = src.replace(`__KEEP_${i}__`, placeholders[i]);
  }
  if (src !== before) {
    fs.writeFileSync(file, src);
    console.log(`${path.relative(process.cwd(), file)}: ${count}`);
    total += count;
  } else {
    console.log(`${path.relative(process.cwd(), file)}: 0`);
  }
  const leftover = [...src.matchAll(/--admin-[a-zA-Z0-9-]+/g)]
    .map((m) => m[0])
    .filter((t) => !keep.has(t));
  if (leftover.length) {
    console.log(`  LEFTOVER: ${[...new Set(leftover)].join(', ')}`);
  }
}
console.log(`Total: ${total}`);
