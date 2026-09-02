#!/usr/bin/env node
/**
 * Compresses fashion demo GLBs into src/assets/demo/models/*-demo.glb (<50MB).
 * Run: npm run demo:optimize-models
 */
import { mkdir, access } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'src/assets/demo/models');

const JOBS = [
  {
    name: 'shoes-demo.glb',
    source: join(ROOT, 'src/assets/models/shoes/shoes1.glb'),
  },
  {
    name: 'bag-demo.glb',
    source: join(ROOT, 'src/assets/models/bag/bag3.glb'),
  },
];

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function optimize({ name, source }) {
  if (!(await exists(source))) {
    console.warn(`skip ${name} — source missing: ${source}`);
    return;
  }
  const dest = join(OUT_DIR, name);
  const bin = join(ROOT, 'node_modules/.bin/gltf-transform');
  console.log(`optimize ${source} -> ${dest}`);
  await execFileAsync(bin, ['optimize', source, dest, '--texture-compress', 'webp']);
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  for (const job of JOBS) {
    await optimize(job);
  }
  console.log('Optimized demo GLBs ready → src/assets/demo/models/*-demo.glb');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
