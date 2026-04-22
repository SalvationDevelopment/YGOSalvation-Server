const fs = require("node:fs");
const path = require("node:path");
const sqlite3 = require("node-sqlite3-wasm");

const repoRoot = path.resolve(__dirname, "../../..");
const fixtureScriptsRoot = path.join(
  repoRoot,
  "tests",
  "fixtures",
  "ocgcore",
  "scripts"
);
const scriptsRoot = path.join(repoRoot, "server", "scripts");
const databaseRoot = path.join(repoRoot, "server", "database");
const coreDistRoot = path.join(repoRoot, "server", "ocgcore", "dist");
const cardsDatabasePath = path.join(databaseRoot, "cards.cdb");

const runtimeScriptFiles = [
  "card_counter_constants.lua",
  "archetype_setcode_constants.lua",
  "constant.lua",
  "utility.lua",
  "debug_utility.lua",
  "cards_specific_functions.lua",
  "proc_fusion.lua",
  "proc_fusion_spell.lua",
  "proc_ritual.lua",
  "proc_synchro.lua",
  "proc_union.lua",
  "proc_xyz.lua",
  "proc_pendulum.lua",
  "proc_link.lua",
  "proc_equip.lua",
  "proc_persistent.lua",
  "proc_workaround.lua",
  "proc_normal.lua",
  "proc_skill.lua",
  "proc_rush.lua",
  "proc_maximum.lua",
  "proc_gemini.lua",
  "proc_spirit.lua",
  "proc_unofficial.lua",
  "deprecated_functions.lua"
];

const coreDistFiles = [
  "index.js",
  "chunk-7I5KICC5.js",
  "chunk-5LIYQQ3H.js",
  "ocgcore.sync-FUQGWQLE.js",
  "ocgcore.sync-RMTY7VHZ.js"
];

function getCoreDistPath(fileName) {
  return path.join(coreDistRoot, fileName);
}

function findMissingRuntimeAssets() {
  const missing = [];

  for (const fileName of coreDistFiles) {
    const filePath = getCoreDistPath(fileName);
    if (!fs.existsSync(filePath)) {
      missing.push(path.relative(repoRoot, filePath));
    }
  }

  if (!fs.existsSync(cardsDatabasePath)) {
    missing.push(path.relative(repoRoot, cardsDatabasePath));
  }

  for (const fileName of runtimeScriptFiles) {
    if (!resolveScriptPath(fileName)) {
      missing.push(path.join("server", "scripts", fileName));
    }
  }

  return missing;
}

function resolveScriptPath(name) {
  const normalized = name.replace(/^[./\\]+/, "");
  const basename = path.basename(normalized);
  const candidates = [
    path.resolve(fixtureScriptsRoot, normalized),
    path.resolve(fixtureScriptsRoot, `${normalized}.lua`),
    path.resolve(fixtureScriptsRoot, basename),
    path.resolve(fixtureScriptsRoot, `${basename}.lua`),
    path.resolve(scriptsRoot, normalized),
    path.resolve(scriptsRoot, `${normalized}.lua`),
    path.resolve(scriptsRoot, basename),
    path.resolve(scriptsRoot, `${basename}.lua`)
  ];

  for (const subdir of [
    "official",
    "unofficial",
    "pre-release",
    "pre-errata",
    "rush",
    "goat"
  ]) {
    candidates.push(path.resolve(scriptsRoot, subdir, normalized));
    candidates.push(path.resolve(scriptsRoot, subdir, `${normalized}.lua`));
    candidates.push(path.resolve(scriptsRoot, subdir, basename));
    candidates.push(path.resolve(scriptsRoot, subdir, `${basename}.lua`));
  }

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return null;
}

function readScriptSource(name) {
  const filePath = resolveScriptPath(name);
  if (!filePath) {
    return null;
  }

  return fs.readFileSync(filePath, "utf8");
}

function createScriptReader() {
  return (name) => readScriptSource(name);
}

function asNumber(value) {
  return typeof value === "number" ? value : Number(value);
}

function asBigInt(value) {
  return typeof value === "bigint" ? value : BigInt(value);
}

function toSetCodes(setcode) {
  const setCodeValue = asBigInt(setcode);
  if (setCodeValue === 0n) {
    return [];
  }

  return [...new Int16Array(BigInt64Array.from([setCodeValue]).buffer)];
}

function loadNormalMonsterCards(limit = 40) {
  const db = new sqlite3.Database(cardsDatabasePath);

  try {
    const rows = db.all(
      `SELECT id, alias, setcode, type, atk, def, level, race, attribute
       FROM datas
       WHERE type = 17
       ORDER BY id
       LIMIT ${limit}`
    );

    if (rows.length < limit) {
      throw new Error(
        `Need at least ${limit} normal monsters in ${path.relative(
          repoRoot,
          cardsDatabasePath
        )}, found ${rows.length}.`
      );
    }

    const cards = new Map();

    for (const row of rows) {
      cards.set(asNumber(row.id), {
        code: asNumber(row.id),
        alias: asNumber(row.alias),
        setcodes: toSetCodes(row.setcode),
        type: asNumber(row.type),
        attack: asNumber(row.atk),
        defense: asNumber(row.def),
        level: asNumber(row.level) & 0xff,
        lscale: (asNumber(row.level) >> 24) & 0xff,
        rscale: (asNumber(row.level) >> 16) & 0xff,
        race: asBigInt(row.race),
        attribute: asNumber(row.attribute),
        link_marker: 0
      });
    }

    return {
      cards,
      codes: rows.map((row) => asNumber(row.id))
    };
  } finally {
    db.close();
  }
}

module.exports = {
  repoRoot,
  fixtureScriptsRoot,
  scriptsRoot,
  databaseRoot,
  coreDistRoot,
  cardsDatabasePath,
  coreDistFiles,
  runtimeScriptFiles,
  findMissingRuntimeAssets,
  resolveScriptPath,
  readScriptSource,
  createScriptReader,
  loadNormalMonsterCards
};
// Run with: npm run test:boot
