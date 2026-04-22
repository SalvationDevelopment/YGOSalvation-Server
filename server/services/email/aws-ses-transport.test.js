import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { test } from 'node:test';

const target = new URL('./aws-ses-transport.js', import.meta.url);

test('aws-ses-transport.js is present with contents', async () => {
  const contents = await readFile(target, 'utf8');
  assert.notEqual(contents.trim().length, 0);
});
