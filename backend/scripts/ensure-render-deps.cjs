const { execSync } = require('child_process');
const path = require('path');

/** Render sets RENDER=true. Install deps locally so runtime finds them in backend/node_modules. */
if (process.env.RENDER !== 'true') {
  process.exit(0);
}

const backendRoot = path.join(__dirname, '..');
console.log('[render] Installing production deps into backend/node_modules (--no-workspaces)...');

execSync('npm install --omit=dev --no-workspaces', {
  cwd: backendRoot,
  stdio: 'inherit',
});
