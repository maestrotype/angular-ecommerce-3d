#!/usr/bin/env node
/**
 * Build a buyer zip for CodeCanyon / Gumroad / own store.
 *
 * Uses `git archive` so untracked files and local secrets never enter the zip.
 * Then overlays generated listing screenshots if present.
 *
 * Usage: npm run pack:marketplace
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const version = require(path.join(root, 'package.json')).version;
const outDir = path.join(root, 'dist-marketplace');
const zipName = `angular-ecommerce-3d-v${version}.zip`;
const zipPath = path.join(outDir, zipName);
const prefix = 'angular-ecommerce-3d/';

const FORBIDDEN = [
  /(^|\/)\.env$/i,
  /(^|\/)\.env\.(local|production|development|staging|secret)$/i,
  /credentials\.json$/i,
  /(^|\/)id_rsa/i,
];

/** Not applied by `git archive HEAD` until .gitattributes is committed. */
const ARCHIVE_EXCLUDES = [
  ':!.cursor',
  ':!.cursor/**',
  ':!backend/uploads',
  ':!backend/uploads/**',
  ':!backend/backend.log',
  ':!local-ai-worker/drone-route-service/outputs',
  ':!local-ai-worker/drone-route-service/outputs/**',
  ':!ssr_output.html',
  ':!marketing-assets/videos',
  ':!marketing-assets/videos/**',
  ':!docs/seller',
  ':!docs/seller/**',
];

const STRIP_REL = [
  '.cursor',
  'backend/uploads',
  'backend/backend.log',
  'local-ai-worker/drone-route-service/outputs',
  'ssr_output.html',
  'marketing-assets/videos',
  'docs/seller',
];

function run(cmd, cwd = root) {
  return execSync(cmd, { cwd, stdio: 'pipe', encoding: 'utf8' });
}

function assertCleanTree() {
  const status = run('git status --porcelain');
  if (status.trim()) {
    console.warn(
      '[pack-marketplace] Working tree has uncommitted changes.\n' +
        '  The zip contains committed files only (git archive).\n' +
        '  Commit listing docs before packing if you want them in the zip.\n',
    );
  }
}

function rmIfExists(target) {
  if (fs.existsSync(target)) {
    fs.rmSync(target, { recursive: true, force: true });
  }
}

function extractArchive(tmp) {
  const archiveZip = path.join(tmp, 'archive.zip');
  const exclude = ARCHIVE_EXCLUDES.map((p) => `"${p}"`).join(' ');
  run(
    `git archive --format=zip --prefix=${prefix} -o "${archiveZip}" HEAD -- . ${exclude}`,
  );
  const extractDir = path.join(tmp, 'extract');
  fs.mkdirSync(extractDir, { recursive: true });
  run(`unzip -q "${archiveZip}" -d "${extractDir}"`);
  stripRuntimeJunk(path.join(extractDir, prefix));
}

function stripRuntimeJunk(pkgRoot) {
  for (const rel of STRIP_REL) {
    rmIfExists(path.join(pkgRoot, rel));
  }
  const uploads = path.join(pkgRoot, 'backend', 'uploads');
  fs.mkdirSync(path.join(uploads, 'products-3d'), { recursive: true });
}

function copyIfExists(fromRel, destRoot) {
  const from = path.join(root, fromRel);
  if (!fs.existsSync(from)) {
    return 0;
  }
  const dest = path.join(destRoot, prefix, fromRel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.cpSync(from, dest, { recursive: true });
  return 1;
}

function walkFiles(dir, acc = []) {
  if (!fs.existsSync(dir)) {
    return acc;
  }
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkFiles(full, acc);
    } else {
      acc.push(full);
    }
  }
  return acc;
}

function assertNoSecrets(extractRoot) {
  const files = walkFiles(extractRoot);
  const hits = files.filter((file) =>
    FORBIDDEN.some((re) => re.test(file.replace(/\\/g, '/'))),
  );
  if (hits.length) {
    throw new Error(
      `Refusing to pack secrets:\n${hits.map((h) => `  ${h}`).join('\n')}`,
    );
  }
}

function writeBuyerReadme(extractRoot) {
  const dest = path.join(extractRoot, prefix, 'START_HERE.md');
  const body = `# Start here

1. Copy \`backend/.env.example\` → \`backend/.env\` and set \`DATABASE_*\`, \`JWT_SECRET\`, \`ADMIN_EMAIL\`, \`ADMIN_PASSWORD\`.
2. \`npm install\`
3. \`npm run demo:models\`
4. Terminal 1: \`npm run backend:start:dev\`
5. Terminal 2: \`npm start\` → http://localhost:4200
6. \`npm run backend:seed\`
7. \`curl -X POST http://localhost:3002/api/auth/create-admin\`

Docs: \`docs/client/index.html\` · Swagger: http://localhost:3002/api/docs

PayPal checkout is a labeled mock. Stripe and LiqPay need your keys in Admin → Settings.
`;
  fs.writeFileSync(dest, body);
}

function main() {
  assertCleanTree();
  fs.mkdirSync(outDir, { recursive: true });

  const tmp = path.join(outDir, '.work');
  fs.rmSync(tmp, { recursive: true, force: true });
  fs.mkdirSync(tmp, { recursive: true });
  try {
    extractArchive(tmp);
    const extractRoot = path.join(tmp, 'extract');

    copyIfExists('screenshots/desktop', extractRoot);
    copyIfExists('screenshots/mobile', extractRoot);
    copyIfExists('screenshots/admin', extractRoot);
    copyIfExists('preview-images', extractRoot);

    writeBuyerReadme(extractRoot);
    assertNoSecrets(extractRoot);

    if (fs.existsSync(zipPath)) {
      fs.unlinkSync(zipPath);
    }
    run(`zip -qr "${zipPath}" ${prefix}`, extractRoot);

    const bytes = fs.statSync(zipPath).size;
    const mb = (bytes / (1024 * 1024)).toFixed(1);
    console.log(`Wrote ${zipPath} (${mb} MB)`);
    if (bytes > 250 * 1024 * 1024) {
      console.warn(
        '[pack-marketplace] Zip is over 250 MB. Envato reviewers often bounce oversized 3D assets.',
      );
    }
    console.log('Next: upload this zip to Gumroad / CodeCanyon. Do not upload .env.');
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

main();
