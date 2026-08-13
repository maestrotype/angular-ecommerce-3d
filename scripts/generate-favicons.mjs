import { mkdir, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const iconsDir = join(root, 'src/assets/icons');
const require = createRequire(join(root, 'backend/package.json'));
const sharp = require('sharp');

const sourceSvg = join(iconsDir, 'app-icon.svg');
const svgBuffer = await readFile(sourceSvg);

const pngTargets = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'icon-72x72.png', size: 72 },
  { name: 'icon-96x96.png', size: 96 },
  { name: 'icon-128x128.png', size: 128 },
  { name: 'icon-144x144.png', size: 144 },
  { name: 'icon-152x152.png', size: 152 },
  { name: 'icon-192x192.png', size: 192 },
  { name: 'icon-384x384.png', size: 384 },
  { name: 'icon-512x512.png', size: 512 },
];

await mkdir(iconsDir, { recursive: true });

for (const { name, size } of pngTargets) {
  const output = join(iconsDir, name);
  // Render large first, then downscale — sharper at 16/32px
  const renderSize = Math.max(size * 4, 128);
  const png = await sharp(svgBuffer)
    .resize(renderSize, renderSize)
    .png()
    .resize(size, size, { kernel: sharp.kernel.lanczos3 })
    .toBuffer();
  await sharp(png).toFile(output);
  console.log(`Wrote ${name}`);
}

await sharp(svgBuffer)
  .resize(128, 128)
  .png()
  .resize(32, 32, { kernel: sharp.kernel.lanczos3 })
  .toFile(join(root, 'src/favicon.ico'));
console.log('Wrote src/favicon.ico');
