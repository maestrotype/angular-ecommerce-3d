#!/usr/bin/env node
/**
 * Publish dist/angular-ecommerce-3d/browser to origin/gh-pages.
 *
 * angular-cli-ghpages enables gh-pages `silent` by default (Commander --no-silent),
 * which hides the real git error. HTTPS push of the demo GLBs also needs a larger
 * HTTP buffer and HTTP/1.1 — otherwise GitHub returns HTTP 400 mid-pack.
 */
const path = require('path');
const ghpages = require('gh-pages');

const dir = path.join(
  process.cwd(),
  'dist',
  'angular-ecommerce-3d',
  'browser'
);

process.env.GIT_CONFIG_COUNT = '2';
process.env.GIT_CONFIG_KEY_0 = 'http.postBuffer';
process.env.GIT_CONFIG_VALUE_0 = '524288000';
process.env.GIT_CONFIG_KEY_1 = 'http.version';
process.env.GIT_CONFIG_VALUE_1 = 'HTTP/1.1';

console.log('🚀 Publishing', dir, 'to gh-pages (this can take a few minutes)…');

ghpages.publish(
  dir,
  {
    silent: false,
    dotfiles: true,
    message: 'Auto-generated commit',
    history: true,
  },
  (error) => {
    if (error) {
      console.error('❌ GitHub Pages publish failed:');
      console.error(error.message || error);
      process.exit(1);
    }
    console.log('🌟 Published to GitHub Pages.');
  }
);
