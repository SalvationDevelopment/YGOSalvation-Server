const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');

const mode = process.argv[2];
const supportedModes = new Set(['unit', 'component', 'parity']);

if (!supportedModes.has(mode)) {
  console.error(`Unsupported test bundle mode: ${mode || '(missing)'}`);
  console.error('Expected one of: unit, component, parity');
  process.exit(1);
}

const workspaceRoot = path.resolve(__dirname, '..');
const sourceDir = path.join(workspaceRoot, 'tests', mode);
const outDir = path.join(workspaceRoot, '.tmp-tests', mode);

/**
 * Recursively collects test entry files.
 * @param {string} dir The directory to scan.
 * @returns {string[]} Matching test file paths.
 */
function collectTestEntries(dir) {
  if (!fs.existsSync(dir)) {
    return [];
  }

  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectTestEntries(fullPath));
      continue;
    }

    if (!/\.(test|spec)\.(c|m)?j(s|sx)$/.test(entry.name)) {
      continue;
    }

    results.push(fullPath);
  }

  return results;
}

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

const entryPoints = collectTestEntries(sourceDir);

if (!entryPoints.length) {
  const placeholderPath = path.join(outDir, 'placeholder.test.js');
  fs.writeFileSync(
    placeholderPath,
    [
      "const { test } = require('node:test');",
      `test.skip('${mode} tests are not implemented yet');`,
      ''
    ].join('\n'),
    'utf8'
  );
  console.log(`[build-test-bundle] no ${mode} tests found; wrote placeholder`);
  process.exit(0);
}

esbuild.build({
  entryPoints,
  outdir: outDir,
  outbase: sourceDir,
  bundle: true,
  packages: 'external',
  platform: 'node',
  format: 'cjs',
  target: 'node18',
  sourcemap: true,
  jsx: 'automatic',
  alias: {
    '@': path.join(workspaceRoot, 'server', 'cms'),
    'next/link': path.join(workspaceRoot, 'tests', mode, 'mocks', 'next-link.js'),
    'next/navigation': path.join(workspaceRoot, 'tests', mode, 'mocks', 'next-navigation.js')
  },
  loader: {
    '.js': 'jsx',
    '.jsx': 'jsx',
    '.cjs': 'js',
    '.mjs': 'js'
  }
}).then(() => {
  console.log(`[build-test-bundle] built ${entryPoints.length} ${mode} test file(s)`);
}).catch((error) => {
  console.error('[build-test-bundle] failed', error);
  process.exit(1);
});
