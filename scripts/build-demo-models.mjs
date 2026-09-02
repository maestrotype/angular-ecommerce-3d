#!/usr/bin/env node
/**
 * Builds fashion demo GLB assets (no mesh/texture destruction).
 * - shoes-catalog.glb: Khronos MaterialsVariantsShoe (clean PBR mesh)
 * - bag-catalog.glb: lossless copy of the source bag scan
 *
 * Run: npm run demo:build-models
 */
import { mkdir, access, copyFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'src/assets/demo/models');

const SHOES_URL =
  'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/MaterialsVariantsShoe/glTF-Binary/MaterialsVariantsShoe.glb';

const JOBS = [
  {
    name: 'shoes-catalog.glb',
    async build() {
      console.log(`fetch Khronos MaterialsVariantsShoe → ${this.name}`);
      const res = await fetch(SHOES_URL);
      if (!res.ok) {
        throw new Error(`Failed to download shoe model: ${res.status} ${res.statusText}`);
      }
      const buf = Buffer.from(await res.arrayBuffer());
      await writeFile(join(OUT_DIR, this.name), buf);
      console.log(`wrote ${this.name} (${(buf.length / 1024 / 1024).toFixed(2)} MB)`);
    },
  },
  {
    name: 'bag-catalog.glb',
    source: join(ROOT, 'src/assets/models/bag/bag3.glb'),
    async build() {
      if (!(await exists(this.source))) {
        console.warn(`skip ${this.name} — source missing: ${this.source}`);
        return;
      }
      const dest = join(OUT_DIR, this.name);
      console.log(`copy (lossless) ${this.source} → ${dest}`);
      await copyFile(this.source, dest);
    },
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

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  for (const job of JOBS) {
    await job.build();
  }
  console.log('Demo catalog GLBs ready → src/assets/demo/models/*-catalog.glb');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
