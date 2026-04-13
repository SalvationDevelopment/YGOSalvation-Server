#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const ROOT_DIR = path.resolve(__dirname, '..');
const DATABASE_DIR = path.join(ROOT_DIR, 'database');
const OUTPUT_DIR = path.join(ROOT_DIR, 'ui', 'public', 'manifest');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'manifest_0-language-merged.json');

/**
 * Parses args used by the export cdb manifests module.
 * @param {string[]} argv The argv array supplies the ordered values used by the export cdb manifests module, including the `length` property.
 * @param {number} argv.length The `length` property supplies structured input used by the export cdb manifests module.
 * @returns {{file: (string|null)}} Returns the value produced by the export cdb manifests module.
 */
function parseArgs(argv) {
  const args = { file: null };

  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--file' && argv[i + 1]) {
      args.file = argv[i + 1];
      i += 1;
    }
  }

  return args;
}

/**
 * Executes the quote identifier helper used by the export cdb manifests module.
 * @param {string} value The value value provides an input used by the export cdb manifests module.
 * @returns {string} Returns the value produced by the export cdb manifests module.
 */
function quoteIdentifier(value) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

/**
 * Exports database file used by the export cdb manifests module.
 * @param {string} cdbPath The cdbPath value provides an input used by the export cdb manifests module.
 * @returns {Record<string, Object[]>} Returns the value produced by the export cdb manifests module.
 */
function exportDatabaseFile(cdbPath) {
  const db = new Database(cdbPath, { readonly: true, fileMustExist: true });

  try {
    const tableRows = db
      .prepare(
        'SELECT name FROM sqlite_master WHERE type = \'table\' AND name NOT LIKE \'sqlite_%\' ORDER BY name ASC'
      )
      .all();

    const tables = {};

    for (const row of tableRows) {
      const tableName = row.name;
      const query = `SELECT * FROM ${quoteIdentifier(tableName)}`;
      tables[tableName] = db.prepare(query).all();
    }

    return tables;
  } finally {
    db.close();
  }
}

/**
 * Gets cdb files used by the export cdb manifests module.
 * @param {string} directory The directory value provides an input used by the export cdb manifests module.
 * @param {string} onlyFile The onlyFile value provides an input used by the export cdb manifests module.
 * @returns {string[]} Returns the value produced by the export cdb manifests module.
 */
function getCdbFiles(directory, onlyFile) {
  const all = fs
    .readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.cdb'))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));

  if (!onlyFile) {
    return all;
  }

  const normalized = onlyFile.toLowerCase().endsWith('.cdb') ? onlyFile : `${onlyFile}.cdb`;
  return all.filter((name) => name.toLowerCase() === normalized.toLowerCase());
}

/**
 * Decodes link markers used by the export cdb manifests module.
 * @param {Object} cardData The cardData object supplies the structured input used by the export cdb manifests module, including the `def` and `type` properties.
 * @param {number} cardData.def The `def` property supplies structured input used by the export cdb manifests module.
 * @param {(string|number)} cardData.type The `type` property supplies structured input used by the export cdb manifests module.
 * @returns {number[]} Returns the value produced by the export cdb manifests module.
 */
function decodeLinkMarkers(cardData) {
  /**
   * Determines whether mask should be treated as valid in the export cdb manifests module.
   * @param {(string|number)} value The value value provides an input used by the export cdb manifests module.
   * @param {number} mask The mask value provides an input used by the export cdb manifests module.
   * @returns {boolean} Returns `true` when mask is valid in the export cdb manifests module and `false` otherwise.
   */
  const hasMask = (value, mask) => Math.floor((Number(value) || 0) / mask) % 2 === 1;

  if (!hasMask(cardData.type, 0x4000000)) {
    return [];
  }

  const markerMask = Number(cardData.def) || 0;
  const markerBits = [0x40, 0x80, 0x100, 0x8, 0x20, 0x1, 0x2, 0x4];

  return markerBits.reduce((markers, bit, index) => {
    if (hasMask(markerMask, bit)) {
      markers.push(index);
    }
    return markers;
  }, []);
}

/**
 * Builds release metadata used by the export cdb manifests module.
 * @param {string} cdbFile The cdbFile value provides an input used by the export cdb manifests module.
 * @returns {{ocg?: {pack: string}, tcg?: {pack: string}}} Returns the value produced by the export cdb manifests module.
 */
function buildReleaseMetadata(cdbFile) {
  const baseName = path.basename(cdbFile, '.cdb');

  if (
    baseName === 'cards'
    || baseName === 'cards-rush'
    || baseName === 'cards-skills'
    || baseName === 'cards-unofficial'
    || baseName === 'cards-skills-unofficial'
    || baseName === 'goat-entries'
  ) {
    return {};
  }

  const pack = baseName
    .replace(/^release-/i, '')
    .replace(/^prerelease-/i, '')
    .trim()
    .toUpperCase();

  if (!pack) {
    return {};
  }

  return {
    ocg: { pack },
    tcg: { pack }
  };
}

/**
 * Builds manifest records used by the export cdb manifests module.
 * @param {string} cdbFile The cdbFile value provides an input used by the export cdb manifests module.
 * @param {Object} tables The tables object supplies the structured input used by the export cdb manifests module, including the `datas`, `datas[]`, and `texts` properties.
 * @param {Object[]} tables.datas The `datas` property supplies structured input used by the export cdb manifests module.
 * @param {(string|number)} tables.datas[].id The `datas[].id` property supplies structured input used by the export cdb manifests module.
 * @param {Object[]} tables.texts The `texts` property supplies structured input used by the export cdb manifests module.
 * @returns {Object[]} Returns the value produced by the export cdb manifests module.
 */
function buildManifestRecords(cdbFile, tables) {
  const datas = Array.isArray(tables.datas) ? tables.datas : [];
  const textsById = new Map(
    (Array.isArray(tables.texts) ? tables.texts : []).map((row) => [Number(row.id), row])
  );
  const releaseMetadata = buildReleaseMetadata(cdbFile);

  return datas.map((dataRow) => {
    const cardId = Number(dataRow.id);
    const textRow = textsById.get(cardId) || {};

    return {
      ...dataRow,
      ...textRow,
      ...releaseMetadata,
      id: cardId,
      sourceFile: cdbFile,
      links: decodeLinkMarkers(dataRow)
    };
  });
}

/**
 * Merges manifest records used by the export cdb manifests module.
 * @param {Object[]} records The records value provides an input used by the export cdb manifests module.
 * @returns {Object[]} Returns the value produced by the export cdb manifests module.
 */
function mergeManifestRecords(records) {
  const merged = new Map();

  for (const record of records) {
    const cardId = Number(record.id);
    const existing = merged.get(cardId);

    if (!existing) {
      merged.set(cardId, {
        ...record,
        sourceFiles: [record.sourceFile]
      });
      continue;
    }

    const sourceFiles = Array.from(
      new Set([...(existing.sourceFiles || []), record.sourceFile])
    );

    merged.set(cardId, {
      ...existing,
      ...record,
      sourceFile: record.sourceFile,
      sourceFiles
    });
  }

  return Array.from(merged.values());
}

/**
 * Removes legacy language manifests used by the export cdb manifests module.
 * @param {string} directory The directory value provides an input used by the export cdb manifests module.
 * @returns {void} Does not return a value.
 */
function removeLegacyLanguageManifests(directory) {
  const legacyFiles = fs
    .readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && /^manifest_0-language-.*\.json$/i.test(entry.name))
    .map((entry) => path.join(directory, entry.name));

  for (const filePath of legacyFiles) {
    fs.unlinkSync(filePath);
    console.log(`[jobs] Removed ${filePath}`);
  }
}

/**
 * Executes the main helper used by the export cdb manifests module.
 * @returns {void} Does not return a value.
 */
function main() {
  const { file } = parseArgs(process.argv.slice(2));

  if (!fs.existsSync(DATABASE_DIR)) {
    throw new Error(`Database directory not found: ${DATABASE_DIR}`);
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const cdbFiles = getCdbFiles(DATABASE_DIR, file);
  if (file && cdbFiles.length === 0) {
    throw new Error(`No .cdb file matched --file ${file}`);
  }

  console.log(`[jobs] Exporting ${cdbFiles.length} .cdb file(s) from ${DATABASE_DIR}`);

  const allRecords = [];

  for (const cdbFile of cdbFiles) {
    const sourcePath = path.join(DATABASE_DIR, cdbFile);
    const tables = exportDatabaseFile(sourcePath);
    const records = buildManifestRecords(cdbFile, tables);
    allRecords.push(...records);
    console.log(`[jobs] Parsed ${cdbFile} (${records.length} card records)`);
  }

  const payload = mergeManifestRecords(allRecords);
  removeLegacyLanguageManifests(OUTPUT_DIR);
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(payload), 'utf8');
  console.log(`[jobs] Wrote ${OUTPUT_FILE} (${payload.length} merged card records)`);
  console.log('[jobs] Done.');
}

main();
