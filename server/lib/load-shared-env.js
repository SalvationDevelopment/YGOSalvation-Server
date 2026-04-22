'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Parses env file used by the load shared env module.
 * @param {string} filePath The filePath value provides an input used by the load shared env module.
 * @returns {Object} Returns the value produced by the load shared env module.
 */
function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const parsed = {};
  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) {
      continue;
    }
    const idx = line.indexOf('=');
    if (idx < 1) {
      continue;
    }

    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith('\'') && value.endsWith('\''))
    ) {
      value = value.slice(1, -1);
    }
    parsed[key] = value;
  }

  return parsed;
}

/**
 * Normalizes admin server url used by the load shared env module.
 * @param {string} value The value value provides an input used by the load shared env module.
 * @returns {string} Returns the value produced by the load shared env module.
 */
function normalizeAdminServerUrl(value) {
  if (!value) {
    return 'http://127.0.0.1:3000/api';
  }
  try {
    const url = new URL(value);
    if (!url.pathname || url.pathname === '/') {
      url.pathname = '/api';
    }
    return url.toString().replace(/\/$/, '');
  } catch {
    return value;
  }
}

/**
 * Loads shared env used by the load shared env module.
 * @returns {void} Does not return a value.
 */
function loadSharedEnv() {
  const repoRoot = path.resolve(__dirname, '..', '..');
  const shellKeys = new Set(Object.keys(process.env));
  const files = [
    path.join(repoRoot, 'configuration', '.env'),
    path.join(repoRoot, 'configuration', '.env.local')
  ];

  const merged = {};
  for (const file of files) {
    Object.assign(merged, parseEnvFile(file));
  }

  for (const [key, value] of Object.entries(merged)) {
    if (!shellKeys.has(key)) {
      process.env[key] = value;
    }
  }

  if (process.env.ADMIN_USERNAME && !shellKeys.has('ADMIN_SERVER_USERNAME')) {
    process.env.ADMIN_SERVER_USERNAME = process.env.ADMIN_USERNAME;
  }
  if (process.env.ADMIN_PASSWORD && !shellKeys.has('ADMIN_SERVER_PASSWORD')) {
    process.env.ADMIN_SERVER_PASSWORD = process.env.ADMIN_PASSWORD;
  }
  process.env.ADMIN_SERVER_URL = normalizeAdminServerUrl(process.env.ADMIN_SERVER_URL);
}

loadSharedEnv();

module.exports = {
  loadSharedEnv
};
