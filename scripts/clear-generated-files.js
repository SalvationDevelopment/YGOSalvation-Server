const { existsSync, readdirSync, rmSync } = require("node:fs");
const { join, resolve } = require("node:path");

function resolveTarget(target, cwd = process.cwd()) {
  return resolve(cwd, target);
}

function shouldDeleteGeneratedFile(name) {
  return name.endsWith(".js") || name.endsWith(".js.map");
}

function clearGeneratedFiles(directory) {
  if (!existsSync(directory)) {
    return;
  }

  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (!entry.isFile()) {
      continue;
    }

    if (!shouldDeleteGeneratedFile(entry.name)) {
      continue;
    }

    rmSync(join(directory, entry.name), { force: true });
  }
}

function main(argv = process.argv) {
  const target = argv[2];

  if (!target) {
    console.error("Usage: node scripts/clear-generated-files.js <directory>");
    process.exit(1);
  }

  clearGeneratedFiles(resolveTarget(target));
}

if (require.main === module) {
  main();
}

module.exports = {
  clearGeneratedFiles,
  main,
  resolveTarget,
  shouldDeleteGeneratedFile,
};
