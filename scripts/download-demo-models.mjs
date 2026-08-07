#!/usr/bin/env node
/**
 * Downloads Khronos CC0 demo GLB models into src/assets/demo/models/
 * Run: npm run demo:models
 */
import { mkdir, writeFile, access } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'src/assets/demo/models');

const MODELS = [
  {
    name: 'duck.glb',
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/Duck/glTF-Binary/Duck.glb',
  },
  {
    name: 'avocado.glb',
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/Avocado/glTF-Binary/Avocado.glb',
  },
  {
    name: 'water-bottle.glb',
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/WaterBottle/glTF-Binary/WaterBottle.glb',
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

async function download({ name, url }) {
  const dest = join(OUT_DIR, name);
  if (await exists(dest)) {
    console.log(`skip ${name} (already present)`);
    return;
  }

  console.log(`fetch ${name}…`);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to download ${name}: ${res.status} ${res.statusText}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(dest, buf);
  console.log(`wrote ${name} (${(buf.length / 1024).toFixed(0)} KB)`);
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  for (const model of MODELS) {
    await download(model);
  }
  console.log('Demo models ready → src/assets/demo/models/');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
