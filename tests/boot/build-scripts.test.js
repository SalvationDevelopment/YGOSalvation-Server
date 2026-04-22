const assert = require("node:assert/strict");
const {
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} = require("node:fs");
const { tmpdir } = require("node:os");
const path = require("node:path");
const test = require("node:test");

const {
  clearGeneratedFiles,
} = require("../../scripts/clear-generated-files.js");
const {
  normalizeMode,
  resolveBuildScript,
  resolveOcgcoreRoot,
  resolveWorkspaceRoot,
} = require("../../scripts/build-emscripten.js");
const legacyBuildScript = require("../../tools/build-ocgapi-emscripten.js");

test("clear-generated-files removes only generated JavaScript artifacts", (t) => {
  const fixtureRoot = mkdtempSync(path.join(tmpdir(), "clear-generated-files-"));
  t.after(() => rmSync(fixtureRoot, { recursive: true, force: true }));

  mkdirSync(path.join(fixtureRoot, "nested"));
  writeFileSync(path.join(fixtureRoot, "index.js"), "console.log('x');");
  writeFileSync(path.join(fixtureRoot, "index.js.map"), "{}");
  writeFileSync(path.join(fixtureRoot, "ocgcore.sync.wasm"), "wasm");
  writeFileSync(path.join(fixtureRoot, "nested", "keep.js"), "nested");

  clearGeneratedFiles(fixtureRoot);

  assert.equal(existsSync(path.join(fixtureRoot, "index.js")), false);
  assert.equal(existsSync(path.join(fixtureRoot, "index.js.map")), false);
  assert.equal(existsSync(path.join(fixtureRoot, "ocgcore.sync.wasm")), true);
  assert.equal(existsSync(path.join(fixtureRoot, "nested", "keep.js")), true);
});

test("workspace build scripts resolve the root script locations and ocgcore target", () => {
  const packageJson = JSON.parse(
    readFileSync(path.resolve(__dirname, "../../package.json"), "utf8"),
  );
  const workspaceRoot = resolveWorkspaceRoot();

  assert.equal(normalizeMode("debug"), "Debug");
  assert.equal(normalizeMode("Release"), "Release");
  assert.equal(resolveBuildScript("Debug"), "./scripts/build-debug.sh");
  assert.equal(resolveBuildScript("Release"), "./scripts/build.sh");
  assert.equal(
    resolveOcgcoreRoot(workspaceRoot),
    path.resolve(workspaceRoot, "server", "game", "core", "ocgcore-wasm"),
  );
  assert.equal(packageJson.scripts.build, "node .\\scripts\\build-emscripten.js Release");
  assert.equal(packageJson.scripts["build:debug"], "node .\\scripts\\build-emscripten.js Debug");
});

test("legacy tools build entrypoint re-exports the root emscripten build script", () => {
  assert.equal(typeof legacyBuildScript.runBuild, "function");
  assert.equal(typeof legacyBuildScript.main, "function");
  assert.equal(legacyBuildScript.resolveWorkspaceRoot(), resolveWorkspaceRoot());
});
