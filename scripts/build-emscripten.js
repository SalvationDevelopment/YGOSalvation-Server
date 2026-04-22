const { spawnSync } = require("node:child_process");
const { existsSync, readdirSync } = require("node:fs");
const { join, resolve } = require("node:path");

function fail(message) {
  console.error(message);
  process.exit(1);
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    stdio: ["pipe", "inherit", "inherit"],
    ...options,
  });

  if (result.error) {
    if (result.error.code === "ENOENT") {
      fail(`Missing required command: ${command}`);
    }

    throw result.error;
  }

  if (result.status === 0) {
    return;
  }

  process.exit(result.status ?? 1);
}

function resolveWorkspaceRoot() {
  return resolve(__dirname, "..");
}

function resolveOcgcoreRoot(workspaceRoot = resolveWorkspaceRoot()) {
  return resolve(workspaceRoot, "server", "game", "core", "ocgcore-wasm");
}

function normalizeMode(value) {
  if (String(value || "").toLowerCase() === "debug") {
    return "Debug";
  }

  return "Release";
}

function resolveBuildScript(mode) {
  if (normalizeMode(mode) === "Debug") {
    return "./scripts/build-debug.sh";
  }

  return "./scripts/build.sh";
}

function findSdkRoot() {
  const candidates = [
    process.env.EMSDK_ROOT,
    process.env.EMSDK,
    "C:\\Program Files\\emsdk",
    "C:\\emsdk",
  ].filter(Boolean);

  for (const candidate of candidates) {
    const root = resolve(candidate);
    if (
      existsSync(join(root, "emsdk_env.sh")) &&
      existsSync(join(root, "upstream", "emscripten", "em++.bat"))
    ) {
      return root;
    }
  }

  fail(
    "Unable to find EMSDK. Set EMSDK_ROOT to a valid install that contains emsdk_env.sh.",
  );
}

function findVersionedBinary(root, folder, relativePath) {
  const base = join(root, folder);
  if (!existsSync(base)) {
    return null;
  }

  const versions = readdirSync(base, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()
    .reverse();

  for (const version of versions) {
    const candidate = join(base, version, relativePath);
    if (existsSync(candidate)) {
      return candidate;
    }
  }

  return null;
}

function toBashPath(filePath) {
  const normalized = filePath.replace(/\\/g, "/");
  return normalized.replace(
    /^([A-Za-z]):/,
    (_, drive) => `/${drive.toLowerCase()}`,
  );
}

function bashQuote(value) {
  return `'${value.replace(/'/g, `'\\''`)}'`;
}

function runBuild(mode = "Release", workspaceRoot = resolveWorkspaceRoot()) {
  const buildMode = normalizeMode(mode),
    ocgcoreRoot = resolveOcgcoreRoot(workspaceRoot),
    buildScript = resolveBuildScript(buildMode);

  if (process.platform !== "win32") {
    run("bash", [buildScript], { cwd: ocgcoreRoot });
    return;
  }

  const sdkRoot = findSdkRoot(),
    python = findVersionedBinary(sdkRoot, "python", "python.exe"),
    node = findVersionedBinary(sdkRoot, "node", join("bin", "node.exe"));

  if (!python || !node) {
    fail("Unable to find EMSDK Python or Node runtime in the selected SDK.");
  }

  const sdkRootBash = toBashPath(sdkRoot),
    pythonBash = toBashPath(python),
    nodeBash = toBashPath(node),
    emppBash = toBashPath(join(sdkRoot, "upstream", "emscripten", "em++.bat")),
    script = [
      "set -euo pipefail",
      "mkdir -p ./.tmp",
      "tmp_dir=$(mktemp -d ./.tmp/emscripten-bin.XXXXXX)",
      'cleanup() { rm -rf "$tmp_dir"; }',
      "trap cleanup EXIT",
      'cat > "$tmp_dir/em++" <<\'EOF\'',
      "#!/bin/sh",
      `"${emppBash}" "$@"`,
      "EOF",
      'chmod +x "$tmp_dir/em++"',
      "export EMSDK_QUIET=1",
      `export EMSDK_PYTHON=${bashQuote(pythonBash)}`,
      `export EMSDK_NODE=${bashQuote(nodeBash)}`,
      "unset EMSDK",
      `. ${bashQuote(`${sdkRootBash}/emsdk_env.sh`)} >/dev/null`,
      'export PATH="$tmp_dir:$PATH"',
      buildScript,
      "",
    ].join("\n");

  run("bash", ["-s"], { cwd: ocgcoreRoot, input: script });
}

function main(argv = process.argv) {
  runBuild(argv[2]);
}

if (require.main === module) {
  main();
}

module.exports = {
  bashQuote,
  findSdkRoot,
  findVersionedBinary,
  main,
  normalizeMode,
  resolveBuildScript,
  resolveOcgcoreRoot,
  resolveWorkspaceRoot,
  runBuild,
  toBashPath,
};
