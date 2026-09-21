/**
 * Render runs with Root Directory = backend/. Workspace hoisting can leave
 * runtime deps in ../node_modules, which is not always on NODE_PATH at start.
 * Preload both local and monorepo-root node_modules before dist/main.js loads.
 */
const fs = require('fs');
const path = require('path');

for (const dir of [
  path.join(__dirname, 'node_modules'),
  path.join(__dirname, '..', 'node_modules'),
]) {
  if (fs.existsSync(dir) && !module.paths.includes(dir)) {
    module.paths.unshift(dir);
  }
}
