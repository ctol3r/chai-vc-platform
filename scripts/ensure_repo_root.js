const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function ensureRepoRootNode() {
  try {
    const root = execSync('git rev-parse --show-toplevel', { encoding: 'utf8' }).trim();
    process.chdir(root);
    console.log('[ensureRepoRootNode] Changed dir to git top-level:', root);
    return;
  } catch (e) {
    // not a git repo or git not available — walk up from cwd
  }

  let dir = path.resolve(process.cwd());
  while (dir !== path.parse(dir).root) {
    if (fs.existsSync(path.join(dir, 'package.json')) || fs.existsSync(path.join(dir, '.git'))) {
      process.chdir(dir);
      console.log('[ensureRepoRootNode] Changed dir to nearest package.json/.git:', dir);
      return;
    }
    dir = path.dirname(dir);
  }
  console.warn('[ensureRepoRootNode] repo root not found; continuing from', process.cwd());
}

ensureRepoRootNode();
